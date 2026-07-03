import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { setActiveCategory } from '../features/categories/categoriesSlice';

export const useCategories = () => {
  const dispatch = useAppDispatch();
  const activeCategory = useAppSelector((state) => state.categories.activeCategory);
  const categoriesOrder = useAppSelector((state) => state.categories.categoriesOrder);

  const selectCategory = useCallback((category: string) => {
    dispatch(setActiveCategory(category));
  }, [dispatch]);

  const handleCategoryClick = useCallback((category: string) => {
    const cleanId = category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + 'Section';
    const element = document.getElementById(cleanId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      dispatch(setActiveCategory(category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()));
    }
  }, [dispatch]);

  return {
    activeCategory,
    categoriesOrder,
    selectCategory,
    handleCategoryClick,
  };
};
