import mongoose, { Schema, Document } from 'mongoose';

export interface ISubstitutionRule extends Document {
    ingredient: string;
    substitutes: string[];
    notAllowedFor: string[]; // dietary restrictions or allergies this ingredient is not allowed for
}

const SubstitutionRuleSchema: Schema = new Schema({
    ingredient: { type: String, required: true, unique: true, lowercase: true },
    substitutes: [{ type: String, required: true }],
    notAllowedFor: [{ type: String }],
}, {
    timestamps: true
});

export default mongoose.model<ISubstitutionRule>('SubstitutionRule', SubstitutionRuleSchema);
