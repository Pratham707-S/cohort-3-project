import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AuthenticatedRequest, TokenPayload } from '../types';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_token_jwt_secret_key_cohort3_2026';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_token_jwt_secret_key_cohort3_2026';
const ACCESS_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY as any });
};

const generateRefreshToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY as any });
};

// 1. Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'User already exists with this email address' });
      return;
    }

    // If first user or specific admin email, make admin
    const userCount = await User.countDocuments();
    const role = userCount === 0 || email.toLowerCase().includes('admin') || email.toLowerCase().includes('pratham') ? 'admin' : 'user';

    const newUser = new User({
      name,
      email,
      password,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || 'user',
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error registering user' });
  }
};

// 2. Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Auto-promote pratham or admin email if needed
    if (!user.role || (user.email.toLowerCase().includes('pratham') && user.role !== 'admin')) {
      user.role = 'admin';
      await user.save();
    }

    const accessToken = generateAccessToken(user._id.toString(), user.email);
    const refreshToken = generateRefreshToken(user._id.toString(), user.email);

    // Save refresh token to DB for revocation support
    user.refreshToken = refreshToken;
    await user.save();

    // Set HTTP-only cookie for refresh token (7 days)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken, // Also returning for client flexibility
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error logging in' });
  }
};

// 3. Refresh Token
export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      res.status(401).json({ message: 'Refresh token is required' });
      return;
    }

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET) as TokenPayload;
    } catch (err: any) {
      res.status(403).json({ message: 'Invalid or expired refresh token. Please log in again.' });
      return;
    }

    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== token) {
      res.status(403).json({ message: 'Refresh token has been revoked or is invalid.' });
      return;
    }

    // Issue brand new access token
    const newAccessToken = generateAccessToken(user._id.toString(), user.email);

    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error refreshing access token' });
  }
};

// 4. Logout
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (req.user) {
      req.user.refreshToken = undefined;
      await req.user.save();
    } else if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) {
        user.refreshToken = undefined;
        await user.save();
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error logging out' });
  }
};

// 5. Get Current User Profile (Me)
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || 'user',
        createdAt: req.user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching user profile' });
  }
};
