import mongoose, { Schema, Document } from 'mongoose';

export interface IShoppingListItem extends Document {
    user_id: mongoose.Types.ObjectId;
    ingredient_name: string;
    quantity: number;
    unit: string;
    category: string;
    is_checked: boolean;
    from_meal_plan: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ShoppingListItemSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ingredient_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true },
    is_checked: { type: Boolean, default: false },
    from_meal_plan: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.model<IShoppingListItem>('ShoppingListItem', ShoppingListItemSchema);
