import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
} from '../controllers/auth.controller';
import { registerValidator, loginValidator } from '../validators/auth.validator';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.post('/refresh-token', refreshAccessToken);

// Authenticated routes
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
