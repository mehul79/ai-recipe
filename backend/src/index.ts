import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import pantryRoutes from './routes/pantryRoutes.js';
import preferenceRoutes from './routes/preferenceRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import mealPlanRoutes from './routes/mealPlanRoutes.js';
import shoppingListRoutes from './routes/shoppingListRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/shopping-list', shoppingListRoutes);

app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the AI Recipe Generator API' });
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || "";

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });


app.listen(8000, () => {
  console.log("running at 8000");
})

export default app;
