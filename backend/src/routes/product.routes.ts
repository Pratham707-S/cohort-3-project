import { Router } from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import {
  createProductValidator,
  updateProductValidator,
  productIdValidator,
  queryProductValidator,
} from '../validators/product.validator';
import { validateRequest } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', queryProductValidator, validateRequest, getProducts);
router.get('/:id', productIdValidator, validateRequest, getProductById);

// Protected routes (require valid access token)
router.post('/', authenticate, createProductValidator, validateRequest, createProduct);
router.put('/:id', authenticate, updateProductValidator, validateRequest, updateProduct);
router.delete('/:id', authenticate, productIdValidator, validateRequest, deleteProduct);

export default router;
