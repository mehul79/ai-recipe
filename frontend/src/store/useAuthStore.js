import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    loading: false,
    isAuthenticated: !!localStorage.getItem('token'),

    login: async (email, password) => {
        set({ loading: true });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    },

    register: async (name, email, password) => {
        set({ loading: true });
        try {
            const response = await api.post('/auth/register', { name, email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({
                user,
                token,
                isAuthenticated: true,
                loading: false
            });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await api.get('/auth/me');
            const { user } = response.data;
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, isAuthenticated: true });
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            set({ user: null, token: null, isAuthenticated: false });
        }
    }
}));

export default useAuthStore;
