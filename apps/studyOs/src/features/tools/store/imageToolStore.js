import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @typedef {Object} ImageItem
 * @property {string} id
 * @property {string} name
 * @property {string} type  - original MIME type
 * @property {number} originalSize
 * @property {number | null} compressedSize
 * @property {string} originalUrl   - object URL
 * @property {string | null} compressedUrl
 * @property {'idle'|'compressing'|'done'|'error'} status
 * @property {number} progress  - 0-100
 * @property {string | null} error
 * @property {string} outputFormat
 * @property {number | null} targetKB
 * @property {number | null} resizeWidth
 * @property {number | null} resizeHeight
 * @property {boolean} lockAspect
 */

const DEFAULT_SETTINGS = {
  outputFormat: 'webp',
  targetKB: 100,
  resizeWidth: null,
  resizeHeight: null,
  lockAspect: true,
  quality: 0.8,
};

export const useImageToolStore = create(
  persist(
    (set, get) => ({
      images: [],
      settings: { ...DEFAULT_SETTINGS },
      history: [], // last 50 compressions metadata

      addImages: (files) => {
        const newItems = files.map((file) => ({
          id: `img_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          name: file.name,
          type: file.type,
          originalSize: file.size,
          compressedSize: null,
          originalUrl: URL.createObjectURL(file),
          compressedUrl: null,
          compressedBlob: null,
          status: 'idle',
          progress: 0,
          error: null,
          outputFormat: get().settings.outputFormat,
          targetKB: get().settings.targetKB,
          resizeWidth: get().settings.resizeWidth,
          resizeHeight: get().settings.resizeHeight,
          lockAspect: get().settings.lockAspect,
          originalWidth: null,
          originalHeight: null,
        }));
        set((s) => ({ images: [...s.images, ...newItems] }));
        return newItems;
      },

      updateImage: (id, patch) =>
        set((s) => ({
          images: s.images.map((img) =>
            img.id === id ? { ...img, ...patch } : img
          ),
        })),

      removeImage: (id) => {
        const img = get().images.find((i) => i.id === id);
        if (img) {
          if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
          if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
        }
        set((s) => ({ images: s.images.filter((i) => i.id !== id) }));
      },

      clearAll: () => {
        get().images.forEach((img) => {
          if (img.originalUrl) URL.revokeObjectURL(img.originalUrl);
          if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
        });
        set({ images: [] });
      },

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      addToHistory: (entry) =>
        set((s) => ({
          history: [entry, ...s.history].slice(0, 50),
        })),

      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'study-os-image-tool',
      partialize: (s) => ({
        settings: s.settings,
        history: s.history,
      }),
    }
  )
);
