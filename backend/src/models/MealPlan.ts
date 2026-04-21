import mongoose, { Schema, Document } from 'mongoose';

export interface IMealPlan extends Document {
    user_id: mongoose.Types.ObjectId;
    recipe_id: mongoose.Types.ObjectId;
    meal_date: Date;
    meal_type: 'breakfast' | 'lunch' | 'dinner';
    createdAt: Date;
    updatedAt: Date;
}

const MealPlanSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    meal_date: { type: Date, required: true },
    meal_type: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
}, {
    timestamps: true
});

export default mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);
