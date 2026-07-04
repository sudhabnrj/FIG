import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useToast } from './useToast';
import { makeStore } from '../store/appStore';

describe('useToast hook', () => {
  it('should trigger and dismiss toast', () => {
    const store = makeStore();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store } as any, children);

    const { result } = renderHook(() => useToast(), { wrapper });

    expect(result.current.isShow).toBe(false);
    expect(result.current.message).toBe('');

    act(() => {
      result.current.triggerToast('Hello World');
    });
    expect(result.current.isShow).toBe(true);
    expect(result.current.message).toBe('Hello World');

    act(() => {
      result.current.dismissToast();
    });
    expect(result.current.isShow).toBe(false);
  });
});
