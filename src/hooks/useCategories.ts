import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { setActiveCategory, clickCategory, clearClickedCategory } from '../features/categories/categoriesSlice';

export const useCategories = () => {
  const dispatch = useAppDispatch();
  const activeCategory = useAppSelector((state) => state.categories.activeCategory);
  const clickedCategory = useAppSelector((state) => state.categories.clickedCategory);
  const categoriesOrder = useAppSelector((state) => state.categories.categoriesOrder);

  const selectCategory = useCallback((category: string) => {
    dispatch(setActiveCategory(category));
  }, [dispatch]);

  const handleCategoryClick = useCallback((category: string) => {
    dispatch(clickCategory(category));
  }, [dispatch]);

  const resetClickedCategory = useCallback(() => {
    dispatch(clearClickedCategory());
  }, [dispatch]);

  return {
    activeCategory,
    clickedCategory,
    categoriesOrder,
    selectCategory,
    handleCategoryClick,
    resetClickedCategory,
  };
};
