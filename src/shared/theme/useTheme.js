import { useEffect, useState } from 'react';

const THEME_VALUES = new Set(['system', 'light', 'dark']);

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem('portfolio-theme');
    return THEME_VALUES.has(storedTheme) ? storedTheme : 'dark';
  } catch {
    return 'dark';
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('portfolio-theme', theme);
    } catch {
      // A blocked storage API should not prevent the theme from applying.
    }
  }, [theme]);

  return { theme, setTheme };
}
