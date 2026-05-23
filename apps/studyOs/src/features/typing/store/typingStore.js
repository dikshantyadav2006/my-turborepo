import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTypingStore = create(
  persist(
    (set) => ({
      // Settings
      mode: 'time', // 'time', 'words', 'quote', 'coding', 'row', 'custom'
      duration: 30, // 15, 30, 60, 180, 300
      wordCount: 25, // 10, 25, 50, 100
      difficulty: 'normal', // 'normal', 'expert' (no backspace), 'master' (error = fail)
      
      // Specialized Mode Settings
      codingLanguage: 'javascript', // 'javascript', 'python', 'html', 'css', 'json', 'terminal'
      rowTarget: 'home', // 'home', 'top', 'bottom', 'numbers', 'symbols'
      customText: '',
      
      currentLesson: null,
      soundEnabled: true,
      keyboardEnabled: true,
      zenMode: false,
      
      // Session State
      isActive: false,
      isFinished: false,
      startTime: null,
      endTime: null,
      
      // Methods
      setMode: (mode) => set({ mode }),
      setDuration: (duration) => set({ duration }),
      setWordCount: (wordCount) => set({ wordCount }),
      setDifficulty: (difficulty) => set({ difficulty }),
      
      setCodingLanguage: (lang) => set({ codingLanguage: lang }),
      setRowTarget: (target) => set({ rowTarget: target }),
      setCustomText: (text) => set({ customText: text }),
      
      setLesson: (lesson) => set({ currentLesson: lesson, mode: 'words' }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setKeyboardEnabled: (enabled) => set({ keyboardEnabled: enabled }),
      setZenMode: (enabled) => set({ zenMode: enabled }),
      
      startSession: () => set({ 
        isActive: true, 
        isFinished: false, 
        startTime: Date.now(),
        endTime: null 
      }),
      
      endSession: () => set({ 
        isActive: false, 
        isFinished: true, 
        endTime: Date.now() 
      }),
      
      resetSession: () => set({ 
        isActive: false, 
        isFinished: false, 
        startTime: null, 
        endTime: null 
      }),
    }),
    {
      name: 'study-typing-settings-v2',
    }
  )
);
