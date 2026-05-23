import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useToolStore = create(
  persist(
    (set, get) => ({
      recentFiles: [], // { id, name, type, size, date, tool }
      favorites: [],
      
      addRecentFile: (file) => {
        const newFile = {
          id: Math.random().toString(36).substring(7),
          ...file,
          date: new Date().toISOString(),
        };
        set((state) => ({
          recentFiles: [newFile, ...state.recentFiles].slice(0, 20),
        }));
      },

      clearRecentFiles: () => set({ recentFiles: [] }),
      
      toggleFavorite: (toolId) => {
        set((state) => ({
          favorites: state.favorites.includes(toolId)
            ? state.favorites.filter((id) => id !== toolId)
            : [...state.favorites, toolId],
        }));
      },
    }),
    {
      name: 'study-os-tools-meta',
    }
  )
);
