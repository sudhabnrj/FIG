import { describe, it, expect } from 'vitest';
import categoriesReducer, { setActiveCategory, clickCategory, clearClickedCategory } from './categoriesSlice';

describe('categoriesSlice', () => {
  it('should return initial state', () => {
    expect(categoriesReducer(undefined, { type: 'unknown' })).toEqual({
      activeCategory: 'ai',
      clickedCategory: null,
      categoriesOrder: ["AI", "UI / UX", "React", "JavaScript", "Next.js"],
    });
  });

  it('should handle setActiveCategory with safe cleaning', () => {
    expect(categoriesReducer(undefined, setActiveCategory('UI / UX'))).toEqual({
      activeCategory: 'uiux',
      clickedCategory: null,
      categoriesOrder: ["AI", "UI / UX", "React", "JavaScript", "Next.js"],
    });

    expect(categoriesReducer(undefined, setActiveCategory('invalid_category'))).toEqual({
      activeCategory: 'ai',
      clickedCategory: null,
      categoriesOrder: ["AI", "UI / UX", "React", "JavaScript", "Next.js"],
    });
  });

  it('should handle clickCategory and clearClickedCategory', () => {
    const clickedState = categoriesReducer(undefined, clickCategory('React'));
    expect(clickedState).toEqual({
      activeCategory: 'react',
      clickedCategory: 'react',
      categoriesOrder: ["AI", "UI / UX", "React", "JavaScript", "Next.js"],
    });

    const clearedState = categoriesReducer(clickedState, clearClickedCategory());
    expect(clearedState.clickedCategory).toBeNull();
  });
});
