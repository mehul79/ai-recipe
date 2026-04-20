import { Response } from 'express';
import Preference from '../models/Preference';

// Get Preferences
export const getPreferences = async (req: any, res: Response): Promise<void> => {
    try {
        let preferences = await Preference.findOne({ userId: req.userId });
        
        // If no preferences found, return default
        if (!preferences) {
            preferences = await Preference.create({ userId: req.userId });
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
            { userId: req.userId },
            { ...req.body },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, data: preferences });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
