import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '../../../lib/db';

export const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      xpHistory: {}, 

      addXP: async (amount) => {
        const today = new Date().toISOString().split('T')[0];
        const currentXP = get().xpHistory[today] || 0;
        const newDayXP = currentXP + amount;
        
        // Save to Dexie
        await db.analytics.put({ date: today, xp: newDayXP });

        set((state) => {
          const newTotalXP = state.xp + amount;
          const newLevel = Math.floor(newTotalXP / 1000) + 1;
          
          return {
            xp: newTotalXP,
            level: newLevel,
            xpHistory: {
              ...state.xpHistory,
              [today]: newDayXP
            }
          };
        });
      },

      loadHistory: async () => {
        const history = await db.analytics.toArray();
        const historyMap = {};
        history.forEach(item => {
          historyMap[item.date] = item.xp;
        });
        set({ xpHistory: historyMap });
      },

      updateStreak: () => {
        const history = get().xpHistory;
        const dates = Object.keys(history).sort();
        if (dates.length === 0) return;

        let currentStreak = 0;
        const today = new Date();
        
        for (let i = 0; i < 365; i++) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          
          if (history[dateStr]) {
            currentStreak++;
          } else if (i > 0) {
            break;
          }
        }
        set({ streak: currentStreak });
      }
    }),
    {
      name: 'study-analytics-storage',
    }
  )
);
