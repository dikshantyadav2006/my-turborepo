import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../../../lib/db';

const getInitialDuration = (mode) => {
  if (mode === 'pomodoro') return 25 * 60;
  if (mode === 'shortBreak') return 5 * 60;
  if (mode === 'longBreak') return 15 * 60;
  return 0; // stopwatch
};

export const useTimerStore = create(
  persist(
    (set, get) => ({
      // Main Countdown Timer State
      timeLeft: 25 * 60,
      isActive: false,
      mode: 'pomodoro', 
      endTime: null,

      // Independent Stopwatch State
      stopwatchTime: 0,
      isStopwatchActive: false,
      stopwatchStartTime: null,

      // Timestamps for stopwatch
      timestamps: [],

      sessions: [],

      setMode: (mode) => {
        const currentMode = get().mode;
        if (mode === currentMode) return;
        
        // If switching between different countdown timers, reset the countdown
        // Otherwise (switching to/from stopwatch), just change the view mode
        if (mode !== 'stopwatch' && currentMode !== 'stopwatch') {
          const time = getInitialDuration(mode);
          set({ mode, timeLeft: time, isActive: false, endTime: null });
        } else {
          set({ mode });
        }
      },

      startTimer: () => {
        const { mode, timeLeft, isActive, stopwatchTime, isStopwatchActive } = get();
        const now = Date.now();
        
        if (mode === 'stopwatch') {
          if (isStopwatchActive) return;
          const startTime = now - (stopwatchTime * 1000);
          set({ isStopwatchActive: true, stopwatchStartTime: startTime });
        } else {
          if (isActive) return;
          const endTime = now + (timeLeft * 1000);
          set({ isActive: true, endTime });
        }
      },

      pauseTimer: () => {
        const { mode } = get();
        get().syncTime();
        
        if (mode === 'stopwatch') {
          set({ isStopwatchActive: false, stopwatchStartTime: null });
        } else {
          set({ isActive: false, endTime: null });
        }
      },

      resetTimer: () => {
        const { mode } = get();
        if (mode === 'stopwatch') {
          set({ stopwatchTime: 0, isStopwatchActive: false, stopwatchStartTime: null, timestamps: [] });
        } else {
          const time = getInitialDuration(mode);
          set({ timeLeft: time, isActive: false, endTime: null });
        }
      },

      syncTime: () => {
        const { isActive, endTime, isStopwatchActive, stopwatchStartTime } = get();
        const now = Date.now();
        
        // Sync stopwatch
        if (isStopwatchActive && stopwatchStartTime) {
          const elapsed = Math.floor((now - stopwatchStartTime) / 1000);
          set({ stopwatchTime: elapsed });
        }
        
        // Sync countdown
        if (isActive && endTime) {
          const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
          if (remaining === 0) {
            set({ isActive: false, timeLeft: 0, endTime: null });
            get().completeSession();
          } else {
            set({ timeLeft: remaining });
          }
        }
      },

      tick: () => {
        get().syncTime();
      },

      addTimestamp: (note = '') => {
        const { stopwatchTime } = get();
        set((state) => ({
          timestamps: [
            { id: Date.now().toString(), time: stopwatchTime, note, createdAt: new Date().toISOString() },
            ...state.timestamps
          ]
        }));
      },

      updateTimestampNote: (id, newNote) => {
        set((state) => ({
          timestamps: state.timestamps.map(ts => 
            ts.id === id ? { ...ts, note: newNote } : ts
          )
        }));
      },

      deleteTimestamp: (id) => {
        set((state) => ({
          timestamps: state.timestamps.filter(ts => ts.id !== id)
        }));
      },

      clearTimestamps: () => {
        set({ timestamps: [] });
      },

      completeSession: async () => {
        const { mode } = get();
        if (mode === 'stopwatch') return; // no auto-complete for stopwatch
        
        const duration = mode === 'pomodoro' ? 25 : mode === 'shortBreak' ? 5 : 15;
        const newSession = {
          mode,
          timestamp: new Date().toISOString(),
          duration,
        };

        // Save to Dexie
        await db.sessions.add(newSession);
        
        set((state) => ({ sessions: [newSession, ...state.sessions] }));
      }
      ,

      // Handle AI-driven events (validated)
      handleAIEvent: (aiEvent) => {
        const ev = aiEvent?.event;
        const payload = aiEvent?.payload || {};
        if (!ev) return;
        switch (ev) {
          case 'TIMER_STARTED':
            const duration = payload.duration;
            if (duration) {
              set({ mode: payload.mode || 'pomodoro', timeLeft: duration * 60, isActive: false, endTime: null });
            }
            get().startTimer();
            break;
          case 'TIMER_RESET':
            get().resetTimer();
            break;
          case 'FOCUS_MODE_STARTED':
            const d = payload.duration || 50;
            set({ mode: 'pomodoro', timeLeft: d * 60, isActive: false, endTime: null });
            get().startTimer();
            break;
          default:
            break;
        }
      }
    }),
    {
      name: 'study-timer-storage',
      partialize: (state) => {
        // High-performance adaptive serialization:
        // Exclude high-frequency ticking fields ONLY when active to prevent 200ms synchronous LocalStorage bottlenecks.
        // When paused (active=false), they are preserved exactly once to allow resuming on page reload!
        const rest = { ...state };
        if (state.isActive) {
          delete rest.timeLeft;
        }
        if (state.isStopwatchActive) {
          delete rest.stopwatchTime;
        }
        return rest;
      }
    }
  )
);
