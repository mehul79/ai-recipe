import { Response } from 'express';
import Preference from '../models/Preference.js';

// Get Preferences
export const getPreferences = async (req: any, res: Response): Promise<void> => {
    try {
        let preferences = await Preference.findOne({ user_id: req.userId });
        
        // If no preferences found, return default
        if (!preferences) {
            preferences = await Preference.create({ user_id: req.userId });
        }

        res.status(200).json({ success: true, data: preferences });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update Preferences
export const updatePreferences = async (req: any, res: Response): Promise<void> => {
    try {
        const preferences = await Preference.findOneAndUpdate(
            { user_id: req.userId },
            { ...req.body },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: preferences });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// 3. ARRAY MODIFIERS ($addToSet, $pull)
// Add a specific tag to a user preference array
export const addPreferenceItem = async (req: any, res: Response): Promise<void> => {
    try {
        const { type, value } = req.body;

        // $addToSet is perfect for unique tags - it adds only if value doesn't exist
        const preferences = await Preference.findOneAndUpdate(
            { user_id: req.userId },
            { $addToSet: { [type]: value } } as any,
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: preferences });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Remove a specific tag from a user preference array
export const removePreferenceItem = async (req: any, res: Response): Promise<void> => {
    try {
        const { type, value } = req.body;

        // $pull removes all instances of the value from the array
        const preferences = await Preference.findOneAndUpdate(
            { user_id: req.userId },
            { $pull: { [type]: value } } as any,
            { new: true }
        );

        res.status(200).json({ success: true, data: preferences });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
