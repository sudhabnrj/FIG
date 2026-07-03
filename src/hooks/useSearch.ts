import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { setSearchQuery } from '../features/search/searchSlice';
import { debounce } from '../utils/debounce';

export const useSearch = () => {
  const dispatch = useAppDispatch();
  const globalQuery = useAppSelector((state) => state.search.query);
  const [localQuery, setLocalQuery] = useState(globalQuery);

  // Sync local query if global query changes from elsewhere (e.g. resets)
  useEffect(() => {
    setLocalQuery(globalQuery);
  }, [globalQuery]);

  // Create a memoized debounced dispatch helper
  const debouncedDispatch = useMemo(
    () => debounce((value: string) => {
      dispatch(setSearchQuery(value));
    }, 300),
    [dispatch]
  );

  const updateSearchQuery = useCallback((newQuery: string) => {
    setLocalQuery(newQuery);
    debouncedDispatch(newQuery);
  }, [debouncedDispatch]);

  return {
    query: globalQuery,
    localQuery,
    updateSearchQuery,
  };
};
