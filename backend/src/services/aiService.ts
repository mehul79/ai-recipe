import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    cooking_tips: string[];
}

export const generateRecipeFromAI = async (
    ingredients: string[],
    preferences: any
): Promise<AIGeneratedRecipe> => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        Generate a detailed recipe based on these ingredients: ${ingredients.join(", ")}.
        Consider these preferences: ${JSON.stringify(preferences)}.
        
        The response MUST be a valid JSON object with EXACTLY this structure:
        {
            "name": "Recipe Name",
            "description": "Short description",
            "cuisine_type": "Cuisine",
            "difficulty": "easy" | "medium" | "hard",
            "prep_time": 10,
            "cook_time": 20,
            "servings": 4,
            "instructions": ["Step 1", "Step 2"],
            "dietary_tags": ["Tag 1", "Tag 2"],
            "ingredients": [{"name": "Ingredient 1", "quantity": 100, "unit": "g"}],
            "nutrition": {"calories": 300, "protein": 10, "carbs": 40, "fats": 5, "fiber": 5},
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
