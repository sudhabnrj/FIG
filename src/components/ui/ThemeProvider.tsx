'use client';

import React, { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, changeTheme } = useTheme();

  // Register PWA service worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          // Service worker successfully registered
        })
        .catch((err) => {
          console.warn('PWA ServiceWorker registration failed:', err);
        });
    }
  }, []);

  // Load theme from localStorage on initial mount
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        changeTheme(storedTheme);
      } else {
        // Fall back to system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        changeTheme(systemPrefersDark ? 'dark' : 'light');
      }
    } catch (e) {
      console.error('Failed to load theme from localStorage:', e);
      changeTheme('light');
    }
  }, [changeTheme]);

  // Apply theme class to document element on changes and persist to localStorage
  useEffect(() => {
    if (!theme) return;
    
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Failed to persist theme to localStorage:', e);
    }

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
};
