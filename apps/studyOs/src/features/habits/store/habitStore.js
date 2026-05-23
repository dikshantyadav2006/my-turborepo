import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// LOCAL GUEST HELPERS (mirrors backend logic in browser for Guest Mode)
const getLocalDayOfWeek = (dateStr) => {
  return new Date(dateStr).getDay();
};

const localComputeHabitStreaks = (logs, habitId) => {
  const successDates = logs
    .filter(log => log.habitId === habitId && ['completed', 'exceeded'].includes(log.status))
    .map(log => log.date)
    .sort((a, b) => b.localeCompare(a));

  if (successDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const sortedSuccess = [...successDates].sort((a, b) => a.localeCompare(b));
  if (sortedSuccess.length > 0) {
    tempStreak = 1;
    bestStreak = 1;
    for (let i = 1; i < sortedSuccess.length; i++) {
      const prevDate = new Date(sortedSuccess[i-1]);
      const currDate = new Date(sortedSuccess[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
  }

  const hasCompletedRecent = successDates.includes(todayStr) || successDates.includes(yesterdayStr);
  if (hasCompletedRecent) {
    let expectedDate = successDates.includes(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);
    for (const dateStr of successDates) {
      const logDate = new Date(dateStr);
      const diffTime = Math.abs(expectedDate - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (diffDays === 1) {
        currentStreak++;
        expectedDate = logDate;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { currentStreak, bestStreak: Math.max(bestStreak, currentStreak) };
};

const localRecalculateAnalytics = (habits, logs) => {
  const activeHabits = habits.filter(h => !h.archived);
  
  // 1. Group logs by date
  const dateLogsMap = {}; // date -> [logs]
  logs.forEach(log => {
    if (!dateLogsMap[log.date]) dateLogsMap[log.date] = [];
    dateLogsMap[log.date].push(log);
  });

  const dailyScores = {}; // date -> score (0-100)
  
  // Calculate daily scores for all recorded log dates
  Object.keys(dateLogsMap).forEach(dateStr => {
    const dayOfWeek = getDayOfWeekStr(dateStr);
    const dayActiveHabits = activeHabits.filter(h => {
      if (h.frequency === 'weekly') return h.daysOfWeek.includes(dayOfWeek);
      return true;
    });

    if (dayActiveHabits.length === 0) {
      dailyScores[dateStr] = 0;
      return;
    }

    const dayLogs = dateLogsMap[dateStr];
    const logMap = new Map(dayLogs.map(l => [l.habitId, l]));

    let totalPoints = 0;
    dayActiveHabits.forEach(habit => {
      const log = logMap.get(habit.id);
      if (log) {
        if (['completed', 'exceeded'].includes(log.status)) {
          totalPoints += 100;
        } else if (log.status === 'partial') {
          totalPoints += Math.min(100, Math.round((log.value / habit.target) * 100));
        }
      }
    });

    dailyScores[dateStr] = Math.min(100, Math.round(totalPoints / dayActiveHabits.length));
  });

  // Calculate User Streak (dailyScore >= 50%)
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const successfulDates = Object.entries(dailyScores)
    .filter(([_, score]) => score >= 50)
    .map(([date, _]) => date)
    .sort((a, b) => b.localeCompare(a));

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const sortedSuccess = [...successfulDates].sort((a, b) => a.localeCompare(b));
  if (sortedSuccess.length > 0) {
    tempStreak = 1;
    bestStreak = 1;
    for (let i = 1; i < sortedSuccess.length; i++) {
      const prevDate = new Date(sortedSuccess[i-1]);
      const currDate = new Date(sortedSuccess[i]);
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
  }

  const hasCompletedRecent = successfulDates.includes(todayStr) || successfulDates.includes(yesterdayStr);
  if (hasCompletedRecent) {
    let expectedDate = successfulDates.includes(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);
    for (const dateStr of successfulDates) {
      const logDate = new Date(dateStr);
      const diffTime = Math.abs(expectedDate - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (diffDays === 1) {
        currentStreak++;
        expectedDate = logDate;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Weekly Consistency (past 7 days)
  const weeklyConsistency = [];
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    weeklyConsistency.push({
      day: weekdays[d.getDay()],
      date: dStr,
      value: dailyScores[dStr] || 0
    });
  }

  // Heatmap Data (daily scores mapped to count)
  const heatmapData = Object.entries(dailyScores).map(([date, score]) => ({
    date,
    count: score
  }));

  // Simple AI suggestion based on local logs
  let aiSuggestion = {
    message: "Create more habits to track your personal performance metrics!",
    habitName: "General"
  };

  if (logs.length > 3 && activeHabits.length > 0) {
    const failures = {}; // habitId -> { dayOfWeek -> { missed: 0, total: 0 } }
    logs.forEach(l => {
      const day = getLocalDayOfWeek(l.date);
      if (!failures[l.habitId]) failures[l.habitId] = {};
      if (!failures[l.habitId][day]) failures[l.habitId][day] = { missed: 0, total: 0 };
      
      failures[l.habitId][day].total++;
      if (l.status === 'missed') failures[l.habitId][day].missed++;
    });

    let worstH = null;
    let worstD = null;
    let worstMissRate = 0.49;

    activeHabits.forEach(h => {
      const hFail = failures[h.id];
      if (hFail) {
        Object.entries(hFail).forEach(([day, stat]) => {
          if (stat.total >= 2) {
            const missRate = stat.missed / stat.total;
            if (missRate > worstMissRate) {
              worstMissRate = missRate;
              worstH = h;
              worstD = parseInt(day, 10);
            }
          }
        });
      }
    });

    const dayNames = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
    if (worstH && worstD !== null) {
      aiSuggestion = {
        message: `You usually miss ${worstH.name} on ${dayNames[worstD]}. Try scheduling it in the morning for better consistency.`,
        habitName: worstH.name
      };
    } else {
      aiSuggestion = {
        message: "You are doing an excellent job maintaining consistency across your Study OS routines!",
        habitName: "General"
      };
    }
  }

  return {
    dailyScore: dailyScores[todayStr] || 0,
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    weeklyConsistency,
    heatmapData,
    aiSuggestion
  };
};

const getDayOfWeekStr = (dateStr) => {
  return new Date(dateStr).getDay();
};

export const useHabitStore = create((set, get) => ({
  habits: [],
  logs: [],
  analytics: {
    dailyScore: 0,
    currentStreak: 0,
    bestStreak: 0,
    weeklyConsistency: [],
    heatmapData: [],
    aiSuggestion: { message: 'Loading...', habitName: 'General' }
  },
  selectedDate: new Date(),
  isLoading: false,
  filter: 'all',

  setSelectedDate: (date) => set({ selectedDate: date }),
  setFilter: (filter) => set({ filter }),

  // 1. Fetch habits and logs
  fetchHabits: async () => {
    const isGuest = useAuthStore.getState().isGuest;
    set({ isLoading: true });

    if (isGuest) {
      const localHabits = JSON.parse(localStorage.getItem('studyos_guest_habits') || '[]');
      const localLogs = JSON.parse(localStorage.getItem('studyos_guest_logs') || '[]');
      
      const habitsWithStreaks = localHabits.map(habit => {
        const streaks = localComputeHabitStreaks(localLogs, habit.id);
        return {
          ...habit,
          currentStreak: streaks.currentStreak,
          bestStreak: streaks.bestStreak
        };
      });

      set({
        habits: habitsWithStreaks,
        logs: localLogs,
        isLoading: false
      });
      get().fetchAnalytics();
    } else {
      try {
        const response = await axios.get(`${API_URL}/habits`);
        if (response.data.success) {
          // Normalize _id field to id
          const habits = response.data.habits.map(h => ({ ...h, id: h._id }));
          const logs = response.data.logs.map(l => ({ ...l, id: l._id }));
          set({ habits, logs, isLoading: false });
        }
      } catch (err) {
        set({ isLoading: false });
      }
    }
  },

  // 2. Fetch Aggregated Analytics
  fetchAnalytics: async () => {
    const isGuest = useAuthStore.getState().isGuest;
    if (isGuest) {
      const localHabits = get().habits;
      const localLogs = get().logs;
      const computedAnalytics = localRecalculateAnalytics(localHabits, localLogs);
      set({ analytics: computedAnalytics });
    } else {
      try {
        const response = await axios.get(`${API_URL}/habits/analytics/summary`);
        if (response.data.success) {
          set({ analytics: response.data.analytics });
        }
      } catch (err) {
        // Fallback or ignore
      }
    }
  },

  // 3. Add a Habit
  addHabit: async (habitData) => {
    const isGuest = useAuthStore.getState().isGuest;
    set({ isLoading: true });

    if (isGuest) {
      const localHabits = JSON.parse(localStorage.getItem('studyos_guest_habits') || '[]');
      const newHabit = {
        ...habitData,
        id: 'local_' + Date.now(),
        archived: false,
        order: localHabits.length,
        createdAt: new Date().toISOString(),
        currentStreak: 0,
        bestStreak: 0
      };
      
      const updatedHabits = [...localHabits, newHabit];
      localStorage.setItem('studyos_guest_habits', JSON.stringify(updatedHabits));
      
      set((state) => ({
        habits: [...state.habits, newHabit],
        isLoading: false
      }));
      get().fetchAnalytics();
    } else {
      try {
        const response = await axios.post(`${API_URL}/habits`, habitData);
        if (response.data.success) {
          const newHabit = { ...response.data.habit, id: response.data.habit._id };
          set((state) => ({
            habits: [...state.habits, newHabit],
            isLoading: false
          }));
          get().fetchAnalytics();
        }
      } catch (err) {
        set({ isLoading: false });
      }
    }
  },

  // 4. Update Habit config
  updateHabit: async (id, updates) => {
    const isGuest = useAuthStore.getState().isGuest;
    set({ isLoading: true });

    if (isGuest) {
      const localHabits = JSON.parse(localStorage.getItem('studyos_guest_habits') || '[]');
      const updatedLocal = localHabits.map(h => h.id === id ? { ...h, ...updates } : h);
      localStorage.setItem('studyos_guest_habits', JSON.stringify(updatedLocal));

      set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h),
        isLoading: false
      }));
      get().fetchAnalytics();
    } else {
      try {
        const response = await axios.put(`${API_URL}/habits/${id}`, updates);
        if (response.data.success) {
          const updatedHabit = { ...response.data.habit, id: response.data.habit._id };
          set((state) => ({
            habits: state.habits.map(h => h.id === id ? updatedHabit : h),
            isLoading: false
          }));
          get().fetchAnalytics();
        }
      } catch (err) {
        set({ isLoading: false });
      }
    }
  },

  // 5. Delete Habit
  deleteHabit: async (id) => {
    const isGuest = useAuthStore.getState().isGuest;
    set({ isLoading: true });

    if (isGuest) {
      const localHabits = JSON.parse(localStorage.getItem('studyos_guest_habits') || '[]');
      const updatedLocalHabits = localHabits.filter(h => h.id !== id);
      localStorage.setItem('studyos_guest_habits', JSON.stringify(updatedLocalHabits));

      const localLogs = JSON.parse(localStorage.getItem('studyos_guest_logs') || '[]');
      const updatedLocalLogs = localLogs.filter(l => l.habitId !== id);
      localStorage.setItem('studyos_guest_logs', JSON.stringify(updatedLocalLogs));

      set((state) => ({
        habits: state.habits.filter(h => h.id !== id),
        logs: state.logs.filter(l => l.habitId !== id),
        isLoading: false
      }));
      get().fetchAnalytics();
    } else {
      try {
        const response = await axios.delete(`${API_URL}/habits/${id}`);
        if (response.data.success) {
          set((state) => ({
            habits: state.habits.filter(h => h.id !== id),
            logs: state.logs.filter(l => l.habitId !== id),
            isLoading: false
          }));
          get().fetchAnalytics();
        }
      } catch (err) {
        set({ isLoading: false });
      }
    }
  },

  // 6. Log Daily Progress
  logProgress: async (habitId, dateStr, value, notes = '') => {
    const isGuest = useAuthStore.getState().isGuest;
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit) return;

    if (isGuest) {
      const localLogs = JSON.parse(localStorage.getItem('studyos_guest_logs') || '[]');
      
      // Determine status
      let status = 'missed';
      if (value === 0) {
        status = 'missed';
      } else if (habit.type === 'boolean') {
        status = value === 1 ? 'completed' : 'missed';
      } else {
        if (value >= habit.target) {
          status = value > habit.target ? 'exceeded' : 'completed';
        } else {
          status = 'partial';
        }
      }

      const existingIndex = localLogs.findIndex(l => l.habitId === habitId && l.date === dateStr);
      const newLog = {
        id: existingIndex >= 0 ? localLogs[existingIndex].id : 'log_' + Date.now(),
        habitId,
        date: dateStr,
        value,
        status,
        notes
      };

      if (existingIndex >= 0) {
        localLogs[existingIndex] = newLog;
      } else {
        localLogs.push(newLog);
      }

      localStorage.setItem('studyos_guest_logs', JSON.stringify(localLogs));

      // Calculate new streaks for the habit
      const streaks = localComputeHabitStreaks(localLogs, habitId);

      set((state) => ({
        logs: existingIndex >= 0 
          ? state.logs.map(l => l.habitId === habitId && l.date === dateStr ? newLog : l)
          : [...state.logs, newLog],
        habits: state.habits.map(h => h.id === habitId ? { ...h, currentStreak: streaks.currentStreak, bestStreak: streaks.bestStreak } : h)
      }));

      get().fetchAnalytics();
    } else {
      try {
        const response = await axios.post(`${API_URL}/habits/${habitId}/log`, { date: dateStr, value, notes });
        if (response.data.success) {
          const backendLog = { ...response.data.log, id: response.data.log._id };
          set((state) => {
            const exists = state.logs.some(l => l.habitId === habitId && l.date === dateStr);
            const updatedLogs = exists
              ? state.logs.map(l => l.habitId === habitId && l.date === dateStr ? backendLog : l)
              : [...state.logs, backendLog];
            
            return {
              logs: updatedLogs,
              habits: state.habits.map(h => h.id === habitId ? { 
                ...h, 
                currentStreak: response.data.currentStreak, 
                bestStreak: response.data.bestStreak 
              } : h)
            };
          });

          // Fetch updated aggregates
          get().fetchAnalytics();
        }
      } catch (err) {
        // Handle error
      }
    }
  },

  // 7. Drag-and-drop Reordering
  reorderHabits: async (orderedIds) => {
    const isGuest = useAuthStore.getState().isGuest;
    
    // Optimistic local state update
    const reorderedHabits = [...get().habits].sort((a, b) => {
      const idxA = orderedIds.indexOf(a.id);
      const idxB = orderedIds.indexOf(b.id);
      return idxA - idxB;
    }).map((h, index) => ({ ...h, order: index }));

    set({ habits: reorderedHabits });

    if (isGuest) {
      localStorage.setItem('studyos_guest_habits', JSON.stringify(reorderedHabits));
    } else {
      try {
        await axios.put(`${API_URL}/habits/reorder`, { orderedIds });
      } catch (err) {
        // Rollback on failure could be implemented, but simple optimistic is robust
      }
    }
  }
}));
