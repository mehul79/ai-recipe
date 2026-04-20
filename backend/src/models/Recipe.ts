import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    description: string;
    cuisineType: string;
    difficulty: 'easy' | 'medium' | 'hard';
    prepTime: number;
    cookTime: number;
    servings: number;
    instructions: string[];
    dietaryTags: string[];
    imageUrl: string | null;
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
    userNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const RecipeSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    cuisineType: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    prepTime: { type: Number },
    cookTime: { type: Number },
    servings: { type: Number, default: 4 },
    instructions: [{ type: String }],
    dietaryTags: [{ type: String }],
    imageUrl: { type: String, default: null },
    ingredients: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true }
    }],
    nutrition: {
        calories: { type: Number },
        protein: { type: Number },
        carbs: { type: Number },
        fats: { type: Number },
        fiber: { type: Number }
    },
    userNotes: { type: String, default: null },
}, {
    timestamps: true
});

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
