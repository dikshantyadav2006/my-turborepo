import { create } from 'zustand';
import { db } from '../../../lib/db';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useTypingAnalyticsStore = create((set, get) => ({
  history: [],
  bestScores: {},
  weakKeys: {},
  isLoading: false,

  loadLocalData: async () => {
    set({ isLoading: true });
    try {
      const history = await db.typingSessions.orderBy('timestamp').reverse().limit(50).toArray();
      const bestScoresArray = await db.typingBestScores.toArray();
      const weakKeysArray = await db.typingWeakKeys.toArray();
      
      const bestScores = {};
      bestScoresArray.forEach(score => {
        bestScores[score.mode] = score;
      });

      const weakKeys = {};
      weakKeysArray.forEach(wk => {
        weakKeys[wk.key] = wk;
      });
      
      set({ history, bestScores, weakKeys, isLoading: false });
    } catch (err) {
      console.error('Failed to load local typing data:', err);
      set({ isLoading: false });
    }
  },

  syncWithCloud: async () => {
    try {
      const unsynced = await db.typingSessions.where('synced').equals(0).toArray();
      if (unsynced.length === 0) return;

      for (const session of unsynced) {
        // Collect weak keys for this session from timing data
        // For now, we use a simplified approach since full timing data is large
        const response = await axios.post(`${API_URL}/typing/session`, {
          wpm: session.wpm,
          accuracy: session.accuracy,
          mode: session.mode,
          duration: session.duration,
          charactersTyped: (session.wpm * (session.duration / 60)) * 5,
          weakKeys: session.weakKeys || [] // Passed from saveSession
        }, { withCredentials: true });
        
        if (response.data.success) {
          await db.typingSessions.update(session.id, { synced: 1 });
        }
      }
    } catch (err) {
      console.warn('Typing sync failed (likely offline):', err.message);
    }
  },

  saveSession: async (sessionData) => {
    const { wpm, accuracy, mode, duration, keyTimings } = sessionData;
    const timestamp = Date.now();
    
    // 1. Process weak keys from timings
    const weakKeysForSync = [];
    if (keyTimings) {
      const breakdown = keyTimings.reduce((acc, kt) => {
        if (!acc[kt.char]) acc[kt.char] = { errors: 0, attempts: 0 };
        acc[kt.char].attempts++;
        if (!kt.correct) acc[kt.char].errors++;
        return acc;
      }, {});

      for (const [char, data] of Object.entries(breakdown)) {
        if (data.errors > 0 || data.attempts > 5) {
          weakKeysForSync.push({ char, ...data });
          
          // Update local weak keys table
          const existing = await db.typingWeakKeys.get(char);
          if (existing) {
            await db.typingWeakKeys.update(char, {
              errors: existing.errors + data.errors,
              attempts: existing.attempts + data.attempts
            });
          } else {
            await db.typingWeakKeys.put({ key: char, ...data });
          }
        }
      }
    }

    try {
      // 2. Save to local Dexie
      const id = await db.typingSessions.add({
        wpm,
        accuracy,
        mode,
        duration,
        timestamp,
        synced: 0,
        weakKeys: weakKeysForSync
      });

      // 3. Update best scores locally
      const currentBest = get().bestScores[mode];
      if (!currentBest || wpm > currentBest.wpm) {
        const newBest = { mode, wpm, accuracy, timestamp };
        await db.typingBestScores.put(newBest);
        set(state => ({
          bestScores: { ...state.bestScores, [mode]: newBest }
        }));
      }

      // 4. Update memory history
      set(state => ({
        history: [{ wpm, accuracy, mode, duration, timestamp }, ...state.history].slice(0, 50)
      }));

      // 5. Sync to Cloud (non-blocking)
      get().syncWithCloud();
      
      return true;
    } catch (err) {
      console.error('Failed to save typing session:', err);
      return false;
    }
  }
}));
