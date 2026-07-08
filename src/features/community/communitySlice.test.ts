import { describe, it, expect } from 'vitest';
import communityReducer, { clearCommunityMessages, setUploading } from './communitySlice';

describe('communitySlice', () => {
  const initialState = {
    drafts: [],
    pendingReviews: [],
    versionHistory: [],
    loading: false,
    uploading: false,
    error: null,
    successMessage: null,
  };

  it('should return initial state', () => {
    expect(communityReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle clearCommunityMessages', () => {
    const stateWithMessage = {
      ...initialState,
      error: 'Failed to save',
      successMessage: 'Saved!',
    };
    const nextState = communityReducer(stateWithMessage, clearCommunityMessages());
    expect(nextState.error).toBeNull();
    expect(nextState.successMessage).toBeNull();
  });

  it('should handle setUploading', () => {
    const nextState = communityReducer(initialState, setUploading(true));
    expect(nextState.uploading).toBe(true);
  });
});
