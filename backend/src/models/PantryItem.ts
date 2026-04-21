import mongoose, { Schema, Document } from 'mongoose';

export interface IPantryItem extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    expiry_date: Date | null;
    is_running_low: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PantryItemSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true },
    expiry_date: { type: Date, default: null },
    is_running_low: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.model<IPantryItem>('PantryItem', PantryItemSchema);
