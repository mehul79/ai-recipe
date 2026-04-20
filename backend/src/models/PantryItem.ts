import mongoose, { Schema, Document } from 'mongoose';

export interface IPantryItem extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    expiryDate: Date | null;
    isRunningLow: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PantryItemSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true },
    expiryDate: { type: Date, default: null },
    isRunningLow: { type: Boolean, default: false },
}, {
    timestamps: true
});

export default mongoose.model<IPantryItem>('PantryItem', PantryItemSchema);
