import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SubstitutionRule from './models/SubstitutionRule.js';

dotenv.config();

const rules = [
    {
        ingredient: 'milk',
        substitutes: ['almond milk', 'soy milk', 'oat milk', 'coconut milk'],
        notAllowedFor: ['Vegan', 'Dairy-Free', 'Lactose Intolerant']
    },
    {
        ingredient: 'butter',
        substitutes: ['coconut oil', 'olive oil', 'vegan butter', 'margarine'],
        notAllowedFor: ['Vegan', 'Dairy-Free']
    },
    {
        ingredient: 'eggs',
        substitutes: ['flax egg', 'chia egg', 'applesauce', 'mashed banana'],
        notAllowedFor: ['Vegan', 'Egg Allergy']
    },
    {
        ingredient: 'paneer',
        substitutes: ['tofu', 'extra firm tofu'],
        notAllowedFor: ['Vegan', 'Dairy-Free']
    },
    {
        ingredient: 'chicken',
        substitutes: ['tofu', 'tempeh', 'seitan', 'mushrooms'],
        notAllowedFor: ['Vegetarian', 'Vegan']
    },
    {
        ingredient: 'beef',
        substitutes: ['lentils', 'mushrooms', 'impossible meat', 'beyond meat'],
        notAllowedFor: ['Vegetarian', 'Vegan']
    },
    {
        ingredient: 'cheese',
        substitutes: ['nutritional yeast', 'vegan cheese', 'cashew cream'],
        notAllowedFor: ['Vegan', 'Dairy-Free']
    },
    {
        ingredient: 'honey',
        substitutes: ['maple syrup', 'agave nectar'],
        notAllowedFor: ['Vegan']
    },
    {
        ingredient: 'soy sauce',
        substitutes: ['coconut aminos', 'tamari'],
        notAllowedFor: ['Gluten-Free', 'Soy Allergy']
    },
    {
        ingredient: 'wheat flour',
        substitutes: ['almond flour', 'oat flour', 'gluten-free all-purpose flour', 'coconut flour'],
        notAllowedFor: ['Gluten-Free', 'Paleo']
    }
];

const seedSubstitutions = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cook-gen');
        console.log('Connected to MongoDB');

        // Clear existing rules
        await SubstitutionRule.deleteMany({});
        console.log('Cleared existing substitution rules');

        // Insert new rules
        await SubstitutionRule.insertMany(rules);
        console.log('Successfully seeded substitution rules');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding substitution rules:', error);
        process.exit(1);
    }
};

seedSubstitutions();
