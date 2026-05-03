import { Router } from 'express';
import { 
    getRecipes, 
    getRecipeById, 
    saveRecipe, 
    deleteRecipe, 
    generateRecipe, 
    getSubstitutions, 
    getRecipesWithIngredient,
    getRecipeStats,
    getMostUsedIngredients,
    getMostViewedRecipes
} from '../controllers/recipeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getRecipes);
router.get('/stats/cuisine', protect, getRecipeStats);
router.get('/stats/ingredients', protect, getMostUsedIngredients);
router.get('/stats/popular', protect, getMostViewedRecipes);
router.get('/ingredients/filter', protect, getRecipesWithIngredient);
router.get('/:id', protect, getRecipeById);
router.post('/', protect, saveRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/generate', protect, generateRecipe);
router.post('/substitutions', protect, getSubstitutions);

export default router;
