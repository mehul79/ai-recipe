import { Response } from 'express';
import MealPlan from '../models/MealPlan';
import Recipe from '../models/Recipe';

// Get meal plans
export const getMealPlans = async (req: any, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query;
        let query: any = { user_id: req.userId };

        if (startDate && endDate) {
            query.meal_date = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        const mealPlans = await MealPlan.find(query)
            .populate('recipe_id', 'name image_url cook_time')
            .sort({ meal_date: 1 });

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
            user_id: req.userId
        });
        res.status(201).json({ success: true, data: mealPlan });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a meal plan
export const deleteMealPlan = async (req: any, res: Response): Promise<void> => {
    try {
        const mealPlan = await MealPlan.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
        if (!mealPlan) {
            res.status(404).json({ success: false, message: 'Meal plan not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Meal removed from plan' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
