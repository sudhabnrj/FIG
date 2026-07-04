import { describe, it, expect } from 'vitest';
import themeReducer, { setTheme, toggleTheme } from './themeSlice';

describe('themeSlice', () => {
  it('should return initial state', () => {
    expect(themeReducer(undefined, { type: 'unknown' })).toEqual({ theme: 'light' });
  });

  it('should handle setTheme', () => {
    expect(themeReducer({ theme: 'light' }, setTheme('dark'))).toEqual({ theme: 'dark' });
  });

  it('should handle toggleTheme', () => {
    expect(themeReducer({ theme: 'light' }, toggleTheme())).toEqual({ theme: 'dark' });
    expect(themeReducer({ theme: 'dark' }, toggleTheme())).toEqual({ theme: 'light' });
  });
});
