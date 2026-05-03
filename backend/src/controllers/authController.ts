import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

// Register User
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'User already exists' });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Generate JWT
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Login User
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user using $or logical operator (email or name)
        const user = await User.findOne({ 
            $or: [
                { email: email },
                { name: email } 
            ]
        });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        // Generate JWT
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get Me (Current User)
export const getMe = async (req: any, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update Password
export const updatePassword = async (req: any, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);
        
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Incorrect current password' });
            return;
        }

        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Update Profile
export const updateProfile = async (req: any, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        const user = await User.findByIdAndUpdate(req.userId, { name }, { new: true });
        
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({ 
            success: true, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Delete Account
export const deleteAccount = async (req: any, res: Response): Promise<void> => {
    try {
        await User.findByIdAndDelete(req.userId);
        // You might want to delete related data (recipes, pantry, etc.) here too
        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
