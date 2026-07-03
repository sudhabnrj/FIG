import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { setSearchQuery } from '../features/search/searchSlice';

export const useSearch = () => {
  const dispatch = useAppDispatch();
  const query = useAppSelector((state) => state.search.query);

  const updateSearchQuery = useCallback((newQuery: string) => {
    dispatch(setSearchQuery(newQuery));
  }, [dispatch]);

  return {
    query,
    updateSearchQuery,
  };
};
