import { Router } from 'express';
import { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct, getAllProducts } from '../controllers/product.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', getProducts);
router.get('/admin/all', protect, adminOnly, getAllProducts);
router.get('/:slug', getProductBySlug);
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
