import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Every product route requires login. This one line applies
// protect to ALL routes declared below it in this file.
router.use(protect);

router.post('/', authorize('admin'), createProduct);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.patch('/:id', authorize('admin'), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

export default router;
