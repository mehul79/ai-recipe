import { Router } from 'express';
import { getMealPlans, addMealPlan, deleteMealPlan } from '../controllers/mealPlanController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', protect, getMealPlans);
router.post('/', protect, addMealPlan);
router.delete('/:id', protect, deleteMealPlan);

export default router;
