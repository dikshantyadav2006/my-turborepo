import { create } from 'zustand';

const STORAGE_KEY = 'studyos-theme';
export const THEME_CHANGE_EVENT = 'studyos-theme-change';

const getSystemTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const readStoredTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  return getSystemTheme();
};

const applyThemeToDocument = (theme) => {
  if (typeof document === 'undefined') return;

  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  document.documentElement.dataset.theme = nextTheme;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: nextTheme } }));
  }
};

export const useThemeStore = create((set, get) => ({
  theme: 'dark',

  initializeTheme: () => {
    const theme = readStoredTheme();
    applyThemeToDocument(theme);
    set({ theme });
    return theme;
  },

  setTheme: (theme) => {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    applyThemeToDocument(nextTheme);
    set({ theme: nextTheme });
    return nextTheme;
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    return get().setTheme(nextTheme);
  },
}));
