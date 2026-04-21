import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipe extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    cuisine_type: string;
    difficulty: 'easy' | 'medium' | 'hard';
    prep_time: number;
    cook_time: number;
    servings: number;
    instructions: string[];
    dietary_tags: string[];
    image_url: string | null;
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
    user_notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const RecipeSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    cuisine_type: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    prep_time: { type: Number },
    cook_time: { type: Number },
    servings: { type: Number, default: 4 },
    instructions: [{ type: String }],
    dietary_tags: [{ type: String }],
    image_url: { type: String, default: null },
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
    cooking_tips: [{ type: String }],
    user_notes: { type: String, default: null },
}, {
    timestamps: true
});

export default mongoose.model<IRecipe>('Recipe', RecipeSchema);
