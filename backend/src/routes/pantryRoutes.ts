import { Router } from 'express';
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem, getPantryStats } from '../controllers/pantryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getPantryItems);
router.get('/stats', protect, getPantryStats);
router.post('/', protect, addPantryItem);
router.put('/:id', protect, updatePantryItem);
router.delete('/:id', protect, deletePantryItem);

export default router;
