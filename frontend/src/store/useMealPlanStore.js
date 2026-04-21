import { create } from 'zustand';
import api from '../services/api';

const useMealPlanStore = create((set, get) => ({
    mealPlans: [],
    loading: false,

    fetchMealPlans: async (startDate, endDate) => {
        set({ loading: true });
        try {
            const response = await api.get('/meal-plans', {
                params: { startDate, endDate }
            });
            set({ mealPlans: response.data.data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.error('Failed to fetch meal plans:', error);
        }
    },

    addMealPlan: async (mealData) => {
        try {
            const response = await api.post('/meal-plans', mealData);
            set({ mealPlans: [...get().mealPlans, response.data.data] });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add meal plan'
            };
        }
    },

    deleteMealPlan: async (id) => {
        try {
            await api.delete(`/meal-plans/${id}`);
            set({
                mealPlans: get().mealPlans.filter((meal) => meal._id !== id)
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to remove meal'
            };
        }
    }
}));

export default useMealPlanStore;
