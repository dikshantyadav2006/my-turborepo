import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAiStore = create((set) => ({
  messages: [],
  isTyping: false,

  sendMessage: async (prompt, type = 'general') => {
    set((state) => ({ 
      messages: [...state.messages, { role: 'user', content: prompt }],
      isTyping: true 
    }));

    try {
      // Simulate AI delay or real call if backend supports it
      const response = await axios.post(`${API_URL}/ai/chat`, { prompt, type });
      
      set((state) => ({ 
        messages: [...state.messages, { role: 'assistant', content: response.data.message }],
        isTyping: false 
      }));
    } catch (err) {
      // Fallback/Mock response for demo
      setTimeout(() => {
        set((state) => ({ 
          messages: [...state.messages, { 
            role: 'assistant', 
            content: "I'm your AI Study Assistant. I can help you plan your sessions, generate quizzes, or summarize your notes. (Note: Backend AI integration pending or in mock mode)" 
          }],
          isTyping: false 
        }));
      }, 1000);
    }
  },
}));
