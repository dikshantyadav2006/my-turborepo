import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';
import { db } from '../../../lib/db';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  syncQueue: [],
  isLoading: false,

  // Load tasks from Dexie on init
  initTasks: async () => {
    const localTasks = await db.tasks.toArray();
    set({ tasks: localTasks });
  },

  addTask: async (taskData) => {
    const isGuest = useAuthStore.getState().isGuest;
    const newTask = {
      ...taskData,
      completed: false,
      createdAt: new Date().toISOString(),
      storageType: isGuest ? 'local' : 'cloud',
    };

    // Save to Dexie immediately
    const id = await db.tasks.add(newTask);
    const taskWithId = { ...newTask, id };

    // Update local state
    set((state) => ({ tasks: [taskWithId, ...state.tasks] }));

    // If logged in, sync to cloud
    if (!isGuest) {
      try {
        await axios.post(`${API_URL}/todos`, taskWithId);
      } catch (err) {
        set((state) => ({ syncQueue: [...state.syncQueue, { type: 'ADD', data: taskWithId }] }));
      }
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };

    // Update Dexie
    await db.tasks.update(id, { completed: updatedTask.completed });

    // Update local state
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? updatedTask : t)
    }));

    // Sync to cloud
    if (!useAuthStore.getState().isGuest) {
      try {
        await axios.put(`${API_URL}/todos/${id}`, updatedTask);
      } catch (err) {
        set((state) => ({ syncQueue: [...state.syncQueue, { type: 'UPDATE', data: updatedTask }] }));
      }
    }
  },

  deleteTask: async (id) => {
    // Remove from Dexie
    await db.tasks.delete(id);

    // Update local state
    set((state) => ({ tasks: state.tasks.filter(t => t.id !== id) }));

    if (!useAuthStore.getState().isGuest) {
      try {
        await axios.delete(`${API_URL}/todos/${id}`);
      } catch (err) {
        set((state) => ({ syncQueue: [...state.syncQueue, { type: 'DELETE', data: id }] }));
      }
    }
  },

  fetchTasks: async () => {
    if (useAuthStore.getState().isGuest) return;

    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/todos`);
      
      // Sync cloud tasks to Dexie
      await db.tasks.clear();
      await db.tasks.bulkAdd(response.data);
      
      set({ tasks: response.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  }
  ,

  // Handle AI-driven events (validated)
  handleAIEvent: async (aiEvent) => {
    const ev = aiEvent?.event;
    const payload = aiEvent?.payload || {};
    if (!ev) return;
    switch (ev) {
      case 'TASK_CREATED':
        // use existing addTask which saves to Dexie and attempts cloud sync
        await get().addTask({ title: payload.title || 'AI Task', focusTime: payload.focusTime || 25 });
        break;
      default:
        break;
    }
  }
}));
