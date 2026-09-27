import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setAccessToken, getAccessToken } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      if (!getAccessToken()) {
        // Try refreshing token in case cookie exists
        const res = await api.post('/auth/refresh-token');
        if (res.data.accessToken) {
          setAccessToken(res.data.accessToken);
        }
      }

      if (getAccessToken()) {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      }
    } catch (err) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleForceLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    const { accessToken, user } = res.data;
    setAccessToken(accessToken);
    setUser(user);
  };

  const register = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    await api.post('/auth/register', data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
