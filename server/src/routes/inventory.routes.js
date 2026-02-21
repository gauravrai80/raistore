import { Router } from 'express';
import { getInventory, updateInventory } from '../controllers/inventory.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/', protect, adminOnly, getInventory);
router.put('/', protect, adminOnly, updateInventory);

export default router;
