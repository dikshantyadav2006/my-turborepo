import { create } from 'zustand';

export const useAIStore = create((set) => ({
  isListening: false,
  transcript: '',
  logs: [],
  status: 'disconnected', // 'disconnected', 'connected', 'processing', 'error', 'waiting_approval'
  latency: 0,
  pendingAction: null, // Holds action waiting for approval

  setIsListening: (isListening) => set({ isListening }),
  setTranscript: (transcript) => set({ transcript }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, { id: Date.now(), ...log }] })),
  setStatus: (status) => set({ status }),
  setLatency: (latency) => set({ latency }),
  setPendingAction: (action) => set({ pendingAction: action, status: 'waiting_approval' }),
  clearPendingAction: () => set({ pendingAction: null, status: 'connected' }),
  clearLogs: () => set({ logs: [] }),
}));
