const STORAGE_KEY = 'studyos-theme';
export const THEME_CHANGE_EVENT = 'studyos-theme-change';

export const isDarkTheme = () => {
  if (typeof document === 'undefined') return true;
  return document.documentElement.classList.contains('dark');
};

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return theme;

  const nextTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  document.documentElement.dataset.theme = nextTheme;

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: { theme: nextTheme } }));
  }

  return nextTheme;
};

export const initTheme = () => applyTheme(getStoredTheme());

export const toggleTheme = () => applyTheme(isDarkTheme() ? 'light' : 'dark');