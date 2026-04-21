import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export interface AIGeneratedRecipe {
    name: string;
    description: string;
    cuisine_type: string;
    difficulty: 'easy' | 'medium' | 'hard';
    prep_time: number;
    cook_time: number;
    servings: number;
    instructions: string[];
    dietary_tags: string[];
    ingredients: {
        name: string;
        quantity: number;
        unit: string;
    }[];
    nutrition: {
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        fiber: number;
    };
}

export const generateRecipeFromAI = async (
        ingredients: string[],
        preferences: any
    ): Promise<AIGeneratedRecipe> => {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const prompt = `
            Generate a detailed recipe based on these ingredients: ${ingredients.join(", ")}.
            User Preferences: ${JSON.stringify(preferences)}.

            STRICT CONSTRAINTS:
            1. If cooking_time_limit is "quick", the TOTAL time (prep + cook) MUST be less than 30 minutes.
            2. If cooking_time_limit is "medium", the TOTAL time (prep + cook) MUST be between 30 and 60 minutes.
            3. If cooking_time_limit is "long", the TOTAL time (prep + cook) can be over 60 minutes.
            4. Respect dietary restrictions and cuisine types if provided.

            The response MUST be a valid JSON object with EXACTLY this structure:
            {
                "name": "Recipe Name",
                "description": "Short description",
                "cuisine_type": "Cuisine",
                "difficulty": "easy" | "medium" | "hard",
                "prep_time": number,
                "cook_time": number,
                "servings": number,
                "instructions": ["Step 1", "Step 2"],
                "dietary_tags": ["Tag 1", "Tag 2"],
                "ingredients": [{"name": "Ingredient 1", "quantity": number, "unit": "string"}],
                "nutrition": {"calories": number, "protein": number, "carbs": number, "fats": number, "fiber": number},
                "cooking_tips": ["Tip 1", "Tip 2"]
            }

            Provide only the JSON object, nothing else.
        `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Clean up the response text in case it includes markdown formatting
        const cleanedJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanedJson);
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate recipe from AI");
    }
};
