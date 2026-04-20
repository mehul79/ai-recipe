import { Response } from 'express';
import Recipe from '../models/Recipe';
import PantryItem from '../models/PantryItem';
import Preference from '../models/Preference';
import { generateRecipeFromAI } from '../services/aiService';

// Get all recipes for a user
export const getRecipes = async (req: any, res: Response): Promise<void> => {
    try {
        const recipes = await Recipe.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: recipes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get single recipe
export const getRecipeById = async (req: any, res: Response): Promise<void> => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, userId: req.userId });
        if (!recipe) {
            res.status(404).json({ success: false, message: 'Recipe not found' });
            return;
        }
        res.status(200).json({ success: true, data: recipe });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Save a recipe
export const saveRecipe = async (req: any, res: Response): Promise<void> => {
    try {
        const recipe = await Recipe.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json({ success: true, data: recipe });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a recipe
export const deleteRecipe = async (req: any, res: Response): Promise<void> => {
    try {
        const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!recipe) {
            res.status(404).json({ success: false, message: 'Recipe not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Recipe deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Generate AI Recipe
export const generateRecipe = async (req: any, res: Response): Promise<void> => {
    try {
        const { ingredients: manualIngredients, usePantry } = req.body;
        
        let ingredients = [...manualIngredients];

        // If usePantry is true, fetch user's pantry items
        if (usePantry) {
            const pantryItems = await PantryItem.find({ userId: req.userId });
            const pantryNames = pantryItems.map(item => item.name);
            ingredients = [...new Set([...ingredients, ...pantryNames])];
        }

        // Fetch user preferences
        const preferences = await Preference.findOne({ userId: req.userId });

        // Generate from AI
        const generatedRecipe = await generateRecipeFromAI(ingredients, preferences);

        res.status(200).json({ success: true, data: generatedRecipe });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate recipe' });
    }
};
