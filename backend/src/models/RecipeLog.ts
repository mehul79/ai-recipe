import mongoose, { Schema, Document } from 'mongoose';

export interface IRecipeLog extends Document {
    user_id: mongoose.Types.ObjectId;
    recipe_id: mongoose.Types.ObjectId;
    action: 'view' | 'save' | 'generate';
    timestamp: Date;
}

const RecipeLogSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    action: { type: String, enum: ['view', 'save', 'generate'], required: true },
    timestamp: { type: Date, default: Date.now }
});

// Indexing for performance
RecipeLogSchema.index({ user_id: 1 });
RecipeLogSchema.index({ recipe_id: 1 });
RecipeLogSchema.index({ action: 1 });
RecipeLogSchema.index({ timestamp: -1 });

export default mongoose.model<IRecipeLog>('RecipeLog', RecipeLogSchema);
