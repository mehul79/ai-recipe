import { Response } from 'express';
import PantryItem from '../models/PantryItem.js';

// Get all pantry items
export const getPantryItems = async (req: any, res: Response): Promise<void> => {
    try {
        const items = await PantryItem.find({ user_id: req.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Add a pantry item
export const addPantryItem = async (req: any, res: Response): Promise<void> => {
    try {
        const newItem = await PantryItem.create({
            ...req.body,
            user_id: req.userId
        });
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update a pantry item
export const updatePantryItem = async (req: any, res: Response): Promise<void> => {
    try {
        const item = await PantryItem.findOneAndUpdate(
            { _id: req.params.id, user_id: req.userId },
            { ...req.body },
            { new: true }
        );

        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }

        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete a pantry item
export const deletePantryItem = async (req: any, res: Response): Promise<void> => {
    try {
        const item = await PantryItem.findOneAndDelete({ _id: req.params.id, user_id: req.userId });

        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Item removed from pantry' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
