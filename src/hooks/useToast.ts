import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { showToast, hideToast } from '../features/ui/uiSlice';

export const useToast = () => {
  const dispatch = useAppDispatch();
  const message = useAppSelector((state) => state.ui.toastMessage);
  const isShow = useAppSelector((state) => state.ui.isToastShow);

  const triggerToast = useCallback((msg: string) => {
    dispatch(showToast(msg));
  }, [dispatch]);

  const dismissToast = useCallback(() => {
    dispatch(hideToast());
  }, [dispatch]);

  return {
    message,
    isShow,
    triggerToast,
    dismissToast,
  };
};
