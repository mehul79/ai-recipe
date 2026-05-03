import { create } from 'zustand';
import api from '../services/api';

const useRecipeStore = create((set, get) => ({
    recipes: [],
    loading: false,
    generating: false,
    generatedRecipe: null,

    fetchRecipes: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/recipes');
            set({ recipes: response.data.data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.error('Failed to fetch recipes:', error);
        }
    },

    getRecipeById: async (id) => {
        try {
            const response = await api.get(`/recipes/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch recipe:', error);
            return null;
        }
    },

    saveRecipe: async (recipeData) => {
        try {
            const response = await api.post('/recipes', recipeData);
            set({ recipes: [response.data.data, ...get().recipes] });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to save recipe'
            };
        }
    },

    deleteRecipe: async (id) => {
        try {
            await api.delete(`/recipes/${id}`);
            set({
                recipes: get().recipes.filter((recipe) => recipe._id !== id)
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete recipe'
            };
        }
    },

    generateRecipe: async (params) => {
        set({ generating: true, generatedRecipe: null });
        try {
            const response = await api.post('/recipes/generate', params);
            set({ generatedRecipe: response.data.data, generating: false });
            return { success: true, data: response.data.data };
        } catch (error) {
            set({ generating: false });
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to generate recipe'
            };
        }
    },

    getSubstitutions: async (ingredients) => {
        try {
            const response = await api.post('/recipes/substitutions', { ingredients });
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch substitutions:', error);
            return [];
        }
    },

    updateGeneratedRecipe: (updatedRecipe) => {
        set({ generatedRecipe: updatedRecipe });
    },

    clearGeneratedRecipe: () => set({ generatedRecipe: null }),

    fetchRecipeStats: async () => {
        try {
            const response = await api.get('/recipes/stats/cuisine');
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch recipe stats:', error);
            return [];
        }
    },

    fetchMostUsedIngredients: async () => {
        try {
            const response = await api.get('/recipes/stats/ingredients');
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch most used ingredients:', error);
            return [];
        }
    },

    fetchPopularRecipes: async () => {
        try {
            const response = await api.get('/recipes/stats/popular');
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch popular recipes:', error);
            return [];
        }
    }
}));

export default useRecipeStore;
