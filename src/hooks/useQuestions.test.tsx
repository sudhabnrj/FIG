import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useQuestions } from './useQuestions';
import { makeStore } from '../store/appStore';
import { mockQuestions } from '../../test/fixtures/questions';

describe('useQuestions hook', () => {
  let store: ReturnType<typeof makeStore>;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    store = makeStore({
      questions: {
        questions: mockQuestions,
        isLoading: false,
        error: null,
        expandedCards: [],
      },
    });
    wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store } as any, children);
  });

  it('should load initial questions and list them', () => {
    const { result } = renderHook(() => useQuestions(), { wrapper });

    expect(result.current.questions).toEqual(mockQuestions);
    expect(result.current.categoryCounts.React).toBe(1);
    expect(result.current.categoryCounts.JavaScript).toBe(1);
  });

  it('should toggle cards and handle expand/collapse all', () => {
    const { result } = renderHook(() => useQuestions(), { wrapper });

    expect(result.current.isCardExpanded(1)).toBe(false);

    act(() => {
      result.current.handleToggleCard(1);
    });
    expect(result.current.isCardExpanded(1)).toBe(true);

    act(() => {
      result.current.handleExpandAll();
    });
    expect(result.current.isCardExpanded(1)).toBe(true);
    expect(result.current.isCardExpanded(2)).toBe(true);

    act(() => {
      result.current.handleCollapseAll();
    });
    expect(result.current.isCardExpanded(1)).toBe(false);
    expect(result.current.isCardExpanded(2)).toBe(false);
  });

  it('should call copyToClipboard when copying questions or answers', () => {
    const originalNavigator = globalThis.navigator;
    const customNavigator = Object.create(originalNavigator);
    customNavigator.clipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    vi.stubGlobal('navigator', customNavigator);

    const { result } = renderHook(() => useQuestions(), { wrapper });

    act(() => {
      result.current.handleCopyQuestion(1);
    });

    expect(customNavigator.clipboard.writeText).toHaveBeenCalled();
  });
});
