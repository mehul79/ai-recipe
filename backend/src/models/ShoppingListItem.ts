import mongoose, { Schema, Document } from 'mongoose';

export interface IShoppingListItem extends Document {
    userId: mongoose.Types.ObjectId;
    ingredientName: string;
    quantity: number;
    unit: string;
    category: string;
    isChecked: boolean;
    fromMealPlan: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ShoppingListItemSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ingredientName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true },
    isChecked: { type: Boolean, default: false },
    fromMealPlan: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.model<IShoppingListItem>('ShoppingListItem', ShoppingListItemSchema);
