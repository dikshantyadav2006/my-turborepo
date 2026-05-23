import { create } from 'zustand';

export const useWidgetStore = create((set) => ({
  activeWidgets: {
    calculator: false,
    whiteboard: false,
    flashcards: false,
    periodicTable: false,
    physics: false,
    planner: false,
  },

  openWidget: (name) => set((state) => ({
    activeWidgets: {
      ...state.activeWidgets,
      [name]: true,
    }
  })),

  closeWidget: (name) => set((state) => ({
    activeWidgets: {
      ...state.activeWidgets,
      [name]: false,
    }
  })),

  toggleWidget: (name) => set((state) => ({
    activeWidgets: {
      ...state.activeWidgets,
      [name]: !state.activeWidgets[name],
    }
  })),

  closeAllWidgets: () => set({
    activeWidgets: {
      calculator: false,
      whiteboard: false,
      flashcards: false,
      periodicTable: false,
      physics: false,
      planner: false,
    }
  }),
}));
