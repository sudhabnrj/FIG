import { describe, it, expect, vi, beforeEach } from 'vitest';
import questionsReducer, { setQuestions, toggleCard, expandAll, collapseAll } from './questionsSlice';
import { mockQuestions } from '../../../test/fixtures/questions';

describe('questionsSlice', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial state', () => {
    expect(questionsReducer(undefined, { type: 'unknown' })).toEqual({
      questions: [],
      isLoading: false,
      error: null,
      expandedCards: [],
    });
  });

  it('should handle setQuestions', () => {
    expect(questionsReducer(undefined, setQuestions(mockQuestions))).toEqual({
      questions: mockQuestions,
      isLoading: false,
      error: null,
      expandedCards: [],
    });
  });

  it('should handle toggleCard', () => {
    const state1 = questionsReducer(undefined, toggleCard(1));
    expect(state1.expandedCards).toEqual([1]);

    const state2 = questionsReducer(state1, toggleCard(1));
    expect(state2.expandedCards).toEqual([]);
  });

  it('should handle expandAll and collapseAll', () => {
    const state1 = questionsReducer(undefined, expandAll([1, 2, 3]));
    expect(state1.expandedCards).toEqual([1, 2, 3]);

    const state2 = questionsReducer(state1, collapseAll());
    expect(state2.expandedCards).toEqual([]);
  });
});
