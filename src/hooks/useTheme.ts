import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { setTheme, toggleTheme } from '../features/theme/themeSlice';

export const useTheme = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const changeTheme = useCallback((newTheme: 'light' | 'dark') => {
    dispatch(setTheme(newTheme));
  }, [dispatch]);

  const toggleAppTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  return {
    theme,
    changeTheme,
    toggleAppTheme,
  };
};
