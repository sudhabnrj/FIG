import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useSearch } from './useSearch';
import { makeStore } from '../store/appStore';

describe('useSearch hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should sync local state with global store and debounce dispatch', () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(Provider, { store } as any, children);

    const { result } = renderHook(() => useSearch(), { wrapper });

    expect(result.current.query).toBe('');
    expect(result.current.localQuery).toBe('');

    act(() => {
      result.current.updateSearchQuery('test query');
    });

    expect(result.current.localQuery).toBe('test query');
    expect(result.current.query).toBe('');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(store.getState().search.query).toBe('test query');
  });
});
