import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { db } from '../../../lib/db';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useNotesStore = create((set, get) => ({
  notes: [],
  isLoading: false,

  initNotes: async () => {
    const localNotes = await db.notes.toArray();
    set({ notes: localNotes });
  },

  addNote: async (noteData) => {
    const isGuest = useAuthStore.getState().isGuest;
    const newNote = {
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      storageType: isGuest ? 'local' : 'cloud',
    };

    const id = await db.notes.add(newNote);
    const noteWithId = { ...newNote, id };

    set((state) => ({ notes: [noteWithId, ...state.notes] }));

    if (!isGuest) {
      try {
        await axios.post(`${API_URL}/notes`, noteWithId);
      } catch (err) {
        console.error('Note sync failed');
      }
    }
  },

  updateNote: async (id, updates) => {
    const updatedAt = new Date().toISOString();
    await db.notes.update(id, { ...updates, updatedAt });

    set((state) => ({
      notes: state.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt } : n)
    }));

    if (!useAuthStore.getState().isGuest) {
      try {
        await axios.put(`${API_URL}/notes/${id}`, updates);
      } catch (err) {
        console.error('Note update failed');
      }
    }
  },

  deleteNote: async (id) => {
    await db.notes.delete(id);
    set((state) => ({ notes: state.notes.filter(n => n.id !== id) }));

    if (!useAuthStore.getState().isGuest) {
      try {
        await axios.delete(`${API_URL}/notes/${id}`);
      } catch (err) {
        console.error('Note deletion failed');
      }
    }
  }
  ,

  // Handle AI-driven events (validated)
  handleAIEvent: async (aiEvent) => {
    const ev = aiEvent?.event;
    const payload = aiEvent?.payload || {};
    if (!ev) return;
    switch (ev) {
      case 'NOTE_CREATED':
        await get().addNote({ title: payload.title || 'AI Note', content: payload.content || '' });
        break;
      default:
        break;
    }
  }
}));
