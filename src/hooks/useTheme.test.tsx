import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useTheme } from './useTheme';
import { makeStore } from '../store/appStore';

describe('useTheme hook', () => {
  it('should toggle theme and set theme', () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store } as any, children);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleAppTheme();
    });
    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.changeTheme('light');
    });
    expect(result.current.theme).toBe('light');
  });
});
