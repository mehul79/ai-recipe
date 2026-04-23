import { Response } from 'express';
import Recipe from '../models/Recipe.js';
import PantryItem from '../models/PantryItem.js';
import Preference from '../models/Preference.js';
import SubstitutionRule from '../models/SubstitutionRule.js';
import RecipeLog from '../models/RecipeLog.js';
import { generateRecipeFromAI } from '../services/aiService.js';

// Get substitutions for a list of ingredients
export const getSubstitutions = async (req: any, res: Response): Promise<void> => {
    try {
        const { ingredients } = req.body;
        
        if (!ingredients || !Array.isArray(ingredients)) {
            res.status(400).json({ success: false, message: 'Invalid ingredients list' });
            return;
        }

        // Clean ingredient names for search (lowercase and trim)
        const ingredientNames = ingredients.map(i => i.toLowerCase().trim());

        // Find rules for these ingredients
        // Using a regex or exact match depending on how strict we want to be
        // For now, let's try to match if the ingredient name contains any of the rule ingredients
        // or vice-versa. A more robust way would be to use a library or AI, but let's stick to DB first.
        
        const rules = await SubstitutionRule.find({
            ingredient: { $in: ingredientNames }
        });

        res.status(200).json({ success: true, data: rules });
    } catch (error) {
        console.error("Get Substitutions Error:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

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

        // Log the view
        await RecipeLog.create({
            user_id: req.userId,
            recipe_id: recipe._id,
            action: 'view'
        });

        // --- ALLERGY & SUBSTITUTION LOGIC ---
        const userPreferences = await Preference.findOne({ user_id: req.userId });
        const userAllergies = userPreferences?.allergies || [];
        const userDiet = userPreferences?.dietary_restrictions || [];
        const allRestrictions = [...new Set([...userAllergies, ...userDiet])];

        const recipeIngredientNames = recipe.ingredients.map(i => i.name.toLowerCase().trim());
        
        const rules = await SubstitutionRule.find({
            ingredient: { $in: recipeIngredientNames }
        });

        const conflicts: any[] = [];
        const substitutionsMap: any = {};

        rules.forEach(rule => {
            const matchedRestrictions = rule.notAllowedFor.filter(r => allRestrictions.includes(r));
            if (matchedRestrictions.length > 0) {
                conflicts.push({
                    ingredient: rule.ingredient,
                    reason: matchedRestrictions[0]
                });
            }
            substitutionsMap[rule.ingredient] = rule.substitutes;
        });

        res.status(200).json({ 
            success: true, 
            data: recipe,
            conflicts,
            substitutions: substitutionsMap
        });
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

        // Log the save
        await RecipeLog.create({
            user_id: req.userId,
            recipe_id: recipe._id,
            action: 'save'
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
            cooking_time,
            recipe_type
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
            cooking_time_limit: cooking_time, // Pass the limit to AI
            recipe_type: recipe_type
        };

        // Generate from AI
        const generatedRecipe = await generateRecipeFromAI(ingredients, combinedPreferences);

        // --- ALLERGY & SUBSTITUTION LOGIC ---
        const userAllergies = userPreferences?.allergies || [];
        const userDiet = combinedPreferences.dietary_restrictions || [];
        const allRestrictions = [...new Set([...userAllergies, ...userDiet])];

        const recipeIngredientNames = generatedRecipe.ingredients.map(i => i.name.toLowerCase().trim());
        
        // Find all rules for these ingredients
        const rules = await SubstitutionRule.find({
            ingredient: { $in: recipeIngredientNames }
        });

        const conflicts: any[] = [];
        const substitutionsMap: any = {};

        rules.forEach(rule => {
            // Check if this ingredient is not allowed for any of the user's restrictions
            const matchedRestrictions = rule.notAllowedFor.filter(r => allRestrictions.includes(r));
            
            if (matchedRestrictions.length > 0) {
                conflicts.push({
                    ingredient: rule.ingredient,
                    reason: matchedRestrictions[0] // Just show the first reason
                });
            }
            
            // Map for easy frontend access
            substitutionsMap[rule.ingredient] = rule.substitutes;
        });

        res.status(200).json({ 
            success: true, 
            data: generatedRecipe,
            conflicts,
            substitutions: substitutionsMap
        });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ success: false, message: 'Failed to generate recipe' });
    }
};
