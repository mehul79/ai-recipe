import mongoose, { Schema, Document } from 'mongoose';

export interface IPreference extends Document {
    user_id: mongoose.Types.ObjectId;
    dietary_restrictions: string[];
    preferred_cuisines: string[];
    default_servings: number;
    measurement_unit: 'metric' | 'imperial';
    allergies: string[];
}

const PreferenceSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dietary_restrictions: [{ type: String }],
    preferred_cuisines: [{ type: String }],
    default_servings: { type: Number, default: 4 },
    measurement_unit: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    allergies: [{ type: String }],
}, {
    timestamps: true
});

export default mongoose.model<IPreference>('Preference', PreferenceSchema);
