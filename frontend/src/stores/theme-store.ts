import { create } from 'zustand';

const STORAGE_KEY = 'event_manager_theme';

export type Theme = 'light' | 'dark';

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hydrate: () => void;
};

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },
  hydrate: () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme = stored === 'dark' || stored === 'light' ? stored : 'light';
    set({ theme });
    applyTheme(theme);
  },
}));
