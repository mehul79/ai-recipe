import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

export const protect = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ success: false, message: 'Not authorized, no token' });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

        // Add user ID to request
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
};
