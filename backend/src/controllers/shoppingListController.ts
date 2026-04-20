import { Response } from 'express';
import ShoppingListItem from '../models/ShoppingListItem.js';
import PantryItem from '../models/PantryItem.js';

// Get shopping list
export const getShoppingList = async (req: any, res: Response): Promise<void> => {
    try {
        const items = await ShoppingListItem.find({ userId: req.userId }).sort({ isChecked: 1, createdAt: -1 });
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Add item
export const addShoppingListItem = async (req: any, res: Response): Promise<void> => {
    try {
        const newItem = await ShoppingListItem.create({
            ...req.body,
            userId: req.userId
        });
        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update item
export const updateShoppingListItem = async (req: any, res: Response): Promise<void> => {
    try {
        const item = await ShoppingListItem.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
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

// Delete item
export const deleteShoppingListItem = async (req: any, res: Response): Promise<void> => {
    try {
        const item = await ShoppingListItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!item) {
            res.status(404).json({ success: false, message: 'Item not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Item removed from list' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Sync checked items to pantry
export const syncPantry = async (req: any, res: Response): Promise<void> => {
    try {
        const checkedItems = await ShoppingListItem.find({ userId: req.userId, isChecked: true });

        if (checkedItems.length === 0) {
            res.status(400).json({ success: false, message: 'No checked items to sync' });
            return;
        }

        // Add each checked item to pantry
        for (const item of checkedItems) {
            // Check if item already exists in pantry
            const existingPantryItem = await PantryItem.findOne({ 
                userId: req.userId, 
                name: { $regex: new RegExp('^' + item.ingredientName + '$', 'i') } 
            });

            if (existingPantryItem) {
                existingPantryItem.quantity += item.quantity;
                await existingPantryItem.save();
            } else {
                await PantryItem.create({
                    userId: req.userId,
                    name: item.ingredientName,
                    quantity: item.quantity,
                    unit: item.unit,
                    category: item.category
                });
            }
        }

        // Remove checked items from shopping list
        await ShoppingListItem.deleteMany({ userId: req.userId, isChecked: true });

        res.status(200).json({ success: true, message: 'Pantry synchronized successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
