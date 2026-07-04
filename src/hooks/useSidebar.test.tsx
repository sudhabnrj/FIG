import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useSidebar } from './useSidebar';
import { makeStore } from '../store/appStore';

describe('useSidebar hook', () => {
  it('should open and close sidebar', () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store } as any, children);

    const { result } = renderHook(() => useSidebar(), { wrapper });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.openSidebar();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeSidebar();
    });
    expect(result.current.isOpen).toBe(false);
  });
});
