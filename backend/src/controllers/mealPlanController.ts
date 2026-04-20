import { Response } from 'express';
import MealPlan from '../models/MealPlan';
import Recipe from '../models/Recipe';

// Get meal plans
export const getMealPlans = async (req: any, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;
        let query: any = { userId: req.userId };

        if (startDate && endDate) {
            query.mealDate = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        const mealPlans = await MealPlan.find(query)
            .populate('recipeId', 'name imageUrl cookTime')
            .sort({ mealDate: 1 });

        res.status(200).json({ success: true, data: mealPlans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Add a meal plan
export const addMealPlan = async (req: any, res: Response): Promise<void> => {
    try {
        const mealPlan = await MealPlan.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json({ success: true, data: mealPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a meal plan
export const deleteMealPlan = async (req: any, res: Response): Promise<void> => {
    try {
        const mealPlan = await MealPlan.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!mealPlan) {
            res.status(404).json({ success: false, message: 'Meal plan not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Meal removed from plan' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
