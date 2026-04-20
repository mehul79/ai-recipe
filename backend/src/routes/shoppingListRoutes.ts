import { Router } from 'express';
import { getShoppingList, addShoppingListItem, updateShoppingListItem, deleteShoppingListItem, syncPantry } from '../controllers/shoppingListController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getShoppingList);
router.post('/', protect, addShoppingListItem);
router.put('/:id', protect, updateShoppingListItem);
router.delete('/:id', protect, deleteShoppingListItem);
router.post('/sync-pantry', protect, syncPantry);

export default router;
