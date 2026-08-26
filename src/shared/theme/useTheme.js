import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme] = useState('dark');

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    try {
      window.localStorage.setItem('portfolio-theme', 'dark');
    } catch {
      // A blocked storage API should not prevent the theme from applying.
    }
  }, []);

  return { theme, setTheme: () => {} };
}
