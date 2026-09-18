import { useEffect, useState } from 'react';

const THEME_VALUES = new Set(['system', 'light', 'dark']);
const THEME_COLORS = Object.freeze({
  light: '#F4F2EA',
  dark: '#08130A',
});

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

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const resolvedTheme = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
    document.documentElement.style.colorScheme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolvedTheme]);

    try {
      window.localStorage.setItem('portfolio-theme', theme);
    } catch {
      // A blocked storage API should not prevent the theme from applying.
    }
  }, [theme]);

  return { theme, setTheme };
}
