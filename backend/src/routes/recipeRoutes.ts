import { Router } from 'express';
import { getRecipes, getRecipeById, saveRecipe, deleteRecipe, generateRecipe } from '../controllers/recipeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getRecipes);
router.get('/:id', protect, getRecipeById);
router.post('/', protect, saveRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/generate', protect, generateRecipe);

export default router;
