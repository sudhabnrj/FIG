import { describe, it, expect } from 'vitest';
import authReducer, { clearAuthError, setGuestSession } from './authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearAuthError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Invalid credentials',
    };
    expect(authReducer(stateWithError, clearAuthError())).toEqual(initialState);
  });

  it('should handle setGuestSession', () => {
    const state = authReducer(initialState, setGuestSession());
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isInitialized).toBe(true);
  });
});
