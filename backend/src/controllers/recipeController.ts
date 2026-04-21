import { Response } from 'express';
import Recipe from '../models/Recipe.js';
import PantryItem from '../models/PantryItem.js';
import Preference from '../models/Preference.js';
import { generateRecipeFromAI } from '../services/aiService.js';

// Get all recipes for a user
export const getRecipes = async (req: any, res: Response): Promise<void> => {
    try {
        const recipes = await Recipe.find({ user_id: req.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: recipes });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get single recipe
export const getRecipeById = async (req: any, res: Response): Promise<void> => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, user_id: req.userId });
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
        console.log("Saving recipe for user:", req.userId);
        console.log("Recipe data:", JSON.stringify(req.body, null, 2));

        const recipe = await Recipe.create({
            ...req.body,
            user_id: req.userId
        });
        res.status(201).json({ success: true, data: recipe });
    } catch (error: any) {
        console.error("Save Recipe Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error',
            details: error.message // Sending details temporarily for debugging
        });
    }
};

// Delete a recipe
export const deleteRecipe = async (req: any, res: Response): Promise<void> => {
    try {
        const recipe = await Recipe.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
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
        const { 
            ingredients: manualIngredients, 
            usePantry, 
            cuisine_type, 
            dietary_restrictions, 
            servings, 
            cooking_time 
        } = req.body;
        
        let ingredients = [...manualIngredients];

        // If usePantry is true, fetch user's pantry items
        if (usePantry) {
            const pantryItems = await PantryItem.find({ user_id: req.userId });
            const pantryNames = pantryItems.map(item => item.name);
            ingredients = [...new Set([...ingredients, ...pantryNames])];
        }

        // Fetch saved user preferences as base
        const userPreferences = await Preference.findOne({ user_id: req.userId });

        // Merge saved preferences with current UI selections
        const combinedPreferences = {
            ...(userPreferences?.toObject() || {}),
            cuisine_type: cuisine_type !== 'Any' ? cuisine_type : userPreferences?.preferred_cuisines?.[0],
            dietary_restrictions: dietary_restrictions?.length > 0 ? dietary_restrictions : userPreferences?.dietary_restrictions,
            servings: servings || userPreferences?.default_servings || 4,
            cooking_time_limit: cooking_time // Pass the limit to AI
        };

        // Generate from AI
        const generatedRecipe = await generateRecipeFromAI(ingredients, combinedPreferences);

        res.status(200).json({ success: true, data: generatedRecipe });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate recipe' });
    }
};
