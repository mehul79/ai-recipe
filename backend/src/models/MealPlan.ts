import mongoose, { Schema, Document } from 'mongoose';

export interface IMealPlan extends Document {
    userId: mongoose.Types.ObjectId;
    recipeId: mongoose.Types.ObjectId;
    mealDate: Date;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    createdAt: Date;
    updatedAt: Date;
}

const MealPlanSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    mealDate: { type: Date, required: true },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
}, {
    timestamps: true
});

export default mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);
