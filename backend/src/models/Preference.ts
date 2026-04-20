import mongoose, { Schema, Document } from 'mongoose';

export interface IPreference extends Document {
    userId: mongoose.Types.ObjectId;
    dietaryRestrictions: string[];
    preferredCuisines: string[];
    defaultServings: number;
    measurementUnit: 'metric' | 'imperial';
    allergies: string[];
}

const PreferenceSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dietaryRestrictions: [{ type: String }],
    preferredCuisines: [{ type: String }],
    defaultServings: { type: Number, default: 4 },
    measurementUnit: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    allergies: [{ type: String }],
}, {
    timestamps: true
});

export default mongoose.model<IPreference>('Preference', PreferenceSchema);
