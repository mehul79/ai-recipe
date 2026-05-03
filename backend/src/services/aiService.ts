import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export interface AIGeneratedRecipe {
    name: string;
    description: string;
    recipe_type: string;
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
    cooking_tips: string[];
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
                name: { type: SchemaType.STRING },
                description: { type: SchemaType.STRING },
                recipe_type: { 
                    type: SchemaType.STRING,
                    enum: ["shake", "dessert", "savory", "complete meal", "snack"]
                },
                cuisine_type: { type: SchemaType.STRING },
                difficulty: { 
                    type: SchemaType.STRING,
                    enum: ["easy", "medium", "hard"]
                },
                prep_time: { type: SchemaType.NUMBER },
                cook_time: { type: SchemaType.NUMBER },
                servings: { type: SchemaType.NUMBER },
                instructions: { 
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                dietary_tags: { 
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                },
                ingredients: { 
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            name: { type: SchemaType.STRING },
                            quantity: { type: SchemaType.NUMBER },
                            unit: { type: SchemaType.STRING }
                        },
                        required: ["name", "quantity", "unit"]
                    }
                },
                nutrition: { 
                    type: SchemaType.OBJECT,
                    properties: {
                        calories: { type: SchemaType.NUMBER },
                        protein: { type: SchemaType.NUMBER },
                        carbs: { type: SchemaType.NUMBER },
                        fats: { type: SchemaType.NUMBER },
                        fiber: { type: SchemaType.NUMBER }
                    },
                    required: ["calories", "protein", "carbs", "fats", "fiber"]
                },
                cooking_tips: { 
                    type: SchemaType.ARRAY,
                    items: { type: SchemaType.STRING }
                }
            },
            required: [
                "name", "description", "recipe_type", "cuisine_type", "difficulty",
                "prep_time", "cook_time", "servings", "instructions", "dietary_tags",
                "ingredients", "nutrition", "cooking_tips"
            ]
        }
    }
});

export const generateRecipeFromAI = async (
    ingredients: string[],
    preferences: any
): Promise<AIGeneratedRecipe> => {

    const prompt = `
        Generate a detailed recipe based on these ingredients: ${ingredients.join(", ")}.
        User Preferences: ${JSON.stringify(preferences)}.

        STRICT CONSTRAINTS:
        1. If cooking_time_limit is "quick", the TOTAL time (prep_time + cook_time) MUST be between 5 and 29 minutes.
        2. If cooking_time_limit is "medium", the TOTAL time (prep_time + cook_time) MUST be between 30 and 60 minutes. DO NOT generate anything less than 30 minutes.
        3. If cooking_time_limit is "long", the TOTAL time (prep_time + cook_time) MUST be over 60 minutes.
        4. If recipe_type is specified (e.g., shake, dessert, savory, complete meal, snack), the recipe MUST match that type.
        5. Respect dietary restrictions and cuisine types if provided.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        if (!text) throw new Error("Empty response from AI");

        return JSON.parse(text);

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate recipe from AI");
    }
};