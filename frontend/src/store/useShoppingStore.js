import { create } from 'zustand';
import api from '../services/api';
import usePantryStore from './usePantryStore';

const useShoppingStore = create((set, get) => ({
    items: [],
    loading: false,

    fetchItems: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/shopping-list');
            set({ items: response.data.data, loading: false });
        } catch (error) {
            set({ loading: false });
            console.error('Failed to fetch shopping list:', error);
        }
    },

    addItem: async (itemData) => {
        try {
            const response = await api.post('/shopping-list', itemData);
            set({ items: [...get().items, response.data.data] });
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
            const response = await api.put(`/shopping-list/${id}`, itemData);
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
            await api.delete(`/shopping-list/${id}`);
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

    syncPantry: async () => {
        try {
            await api.post('/shopping-list/sync-pantry');
            // Clear checked items from local state
            set({
                items: get().items.filter((item) => !item.is_checked)
            });
            // Refresh pantry store
            usePantryStore.getState().fetchItems();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to sync pantry'
            };
        }
    }
}));

export default useShoppingStore;
