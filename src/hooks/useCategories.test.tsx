import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useCategories } from './useCategories';
import { makeStore } from '../store/appStore';

describe('useCategories hook', () => {
  it('should select categories and handle click', () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store } as any, children);

    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(result.current.activeCategory).toBe('ai');
    expect(result.current.clickedCategory).toBeNull();

    act(() => {
      result.current.selectCategory('React');
    });
    expect(result.current.activeCategory).toBe('react');

    act(() => {
      result.current.handleCategoryClick('JavaScript');
    });
    expect(result.current.activeCategory).toBe('javascript');
    expect(result.current.clickedCategory).toBe('javascript');

    act(() => {
      result.current.resetClickedCategory();
    });
    expect(result.current.clickedCategory).toBeNull();
  });
});
