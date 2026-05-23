import { create } from 'zustand';

let seenEvents = new Set(); // in-memory dedupe: traceId|sessionId

export const useAiStore = create((set, get) => ({
  aiConnected: false,
  lastAIEvent: null,
  activeSession: null,
  aiStatus: 'idle',

  markSeen: (traceId, sessionId) => {
    const key = `${traceId}|${sessionId}`;
    seenEvents.add(key);
  },

  isSeen: (traceId, sessionId) => {
    const key = `${traceId}|${sessionId}`;
    return seenEvents.has(key);
  },

  setLastEvent: (evt) => set({ lastAIEvent: evt }),
  setActiveSession: (sid) => set({ activeSession: sid }),
  setAiStatus: (s) => set({ aiStatus: s }),
}));

// helper for non-hook modules
export function getAiStore() {
  return useAiStore;
}

export default useAiStore;
