import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', protect, getWishlist);
router.post('/', protect, addToWishlist);
router.delete('/:product_id', protect, removeFromWishlist);

export default router;
