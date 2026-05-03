import { create } from 'zustand';
import api from '../services/api';

const usePantryStore = create((set, get) => ({
    items: [],
    loading: false,

    fetchItems: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/pantry');
            set({ items: response.data.data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.error('Failed to fetch pantry items:', error);
        }
    },

    addItem: async (itemData) => {
        try {
            const response = await api.post('/pantry', itemData);
            set({ items: [response.data.data, ...get().items] });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to add item'
            };
        }
    },

    updateItem: async (id, itemData) => {
        try {
            const response = await api.put(`/pantry/${id}`, itemData);
            set({
                items: get().items.map((item) =>
                    item._id === id ? response.data.data : item
                )
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update item'
            };
        }
    },

    deleteItem: async (id) => {
        try {
            await api.delete(`/pantry/${id}`);
            set({
                items: get().items.filter((item) => item._id !== id)
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete item'
            };
        }
    },

    getExpiringItems: () => {
        const today = new Date();
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

        return get().items.filter(item => {
            if (!item.expiry_date) return false;
            const expiryDate = new Date(item.expiry_date);
            return expiryDate >= today && expiryDate <= sevenDaysFromNow;
        });
    },

    fetchPantryStats: async () => {
        try {
            const response = await api.get('/pantry/stats');
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch pantry stats:', error);
            return [];
        }
    }
}));

export default usePantryStore;
