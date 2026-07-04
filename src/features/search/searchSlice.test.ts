import { describe, it, expect } from 'vitest';
import searchReducer, { setSearchQuery } from './searchSlice';

describe('searchSlice', () => {
  it('should return the initial state', () => {
    expect(searchReducer(undefined, { type: 'unknown' })).toEqual({ query: '' });
  });

  it('should handle setSearchQuery', () => {
    const previousState = { query: '' };
    expect(searchReducer(previousState, setSearchQuery('test'))).toEqual({ query: 'test' });
  });

  it('should truncate query to 100 characters', () => {
    const longQuery = 'a'.repeat(120);
    const previousState = { query: '' };
    expect(searchReducer(previousState, setSearchQuery(longQuery))).toEqual({ query: 'a'.repeat(100) });
  });
});
