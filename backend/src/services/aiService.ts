import OpenAI from "openai";
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

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
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

        The response MUST be a valid JSON object with EXACTLY this structure:
        {
            "name": "Recipe Name",
            "description": "Short description",
            "recipe_type": "shake" | "dessert" | "savory" | "complete meal" | "snack",
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

        Respond with ONLY the raw JSON object. No markdown, no backticks, no explanation.
    `;

    try {
        const response = await client.chat.completions.create({
            model: "inclusionai/ling-2.6-flash:free",
            messages: [
                {
                    role: "system",
                    content: "You are a professional chef and nutritionist. Always respond with valid raw JSON only, no markdown formatting."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
        });

        const text = response.choices[0].message.content;
        if (!text) throw new Error("Empty response from AI");

        // More robust JSON extraction
        let jsonStr = text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("Failed to generate recipe from AI");
    }
};