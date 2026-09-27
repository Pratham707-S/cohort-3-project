import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

export default router;
