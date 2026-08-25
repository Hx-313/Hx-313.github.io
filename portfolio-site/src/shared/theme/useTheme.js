import { useEffect, useState } from 'react';

const STORAGE_KEY = 'portfolio-theme';
const THEMES = ['system', 'light', 'dark'];

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(() => (typeof window === 'undefined' ? 'system' : readStoredTheme()));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      if (theme === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // A blocked storage API should not prevent the theme from applying.
    }
  }, [theme]);

  return { theme, setTheme };
}
