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
    const root = document.documentElement;
    root.dataset.theme = theme;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateThemeColor = () => {
      const resolvedTheme = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
      root.style.colorScheme = resolvedTheme;
      const background = getComputedStyle(root).getPropertyValue('--color-background').trim();
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background);
    };

    updateThemeColor();
    mediaQuery.addEventListener('change', updateThemeColor);
    try {
      window.localStorage.setItem('portfolio-theme', theme);
    } catch {
      // A blocked storage API should not prevent the theme from applying.
    }
    return () => mediaQuery.removeEventListener('change', updateThemeColor);
  }, [theme]);

  return { theme, setTheme };
}
