import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { setMobileSidebarOpen } from '../features/ui/uiSlice';

export const useSidebar = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isMobileSidebarOpen);

  const openSidebar = useCallback(() => {
    dispatch(setMobileSidebarOpen(true));
  }, [dispatch]);

  const closeSidebar = useCallback(() => {
    dispatch(setMobileSidebarOpen(false));
  }, [dispatch]);

  return {
    isOpen,
    openSidebar,
    closeSidebar,
  };
};
