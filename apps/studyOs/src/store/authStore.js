import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isGuest: true,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/login`, { identifier: email, password });
          set({ 
            user: response.data.user, 
            isGuest: false, 
            isLoading: false 
          });
          return true;
        } catch (err) {
          set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${API_URL}/auth/register`, userData);
          set({ 
            user: response.data.user, 
            isGuest: false, 
            isLoading: false 
          });
          return true;
        } catch (err) {
          set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
          return false;
        }
      },

      logout: async () => {
        try {
          await axios.post(`${API_URL}/auth/logout`);
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          get().clearLocalState();
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await axios.get(`${API_URL}/auth/userdata`);
          set({ 
            user: response.data, 
            isGuest: false, 
            isLoading: false 
          });
          return true;
        } catch (err) {
          // If userdata fails, we are not logged in
          set({ user: null, isGuest: true, isLoading: false });
          return false;
        }
      },

      clearLocalState: () => {
        set({ user: null, isGuest: true, error: null });
        // Clear any other local data if necessary (e.g., sync queues)
      },

      setGuestMode: () => {
        set({ user: null, isGuest: true });
      }
    }),
    {
      name: 'study-auth-storage',
      partialize: (state) => ({ user: state.user, isGuest: state.isGuest }),
    }
  )
);
