import { describe, it, expect } from 'vitest';
import uiReducer, { setMobileSidebarOpen, showToast, hideToast } from './uiSlice';

describe('uiSlice', () => {
  it('should return initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual({
      isMobileSidebarOpen: false,
      toastMessage: '',
      isToastShow: false,
    });
  });

  it('should handle setMobileSidebarOpen', () => {
    expect(uiReducer(undefined, setMobileSidebarOpen(true))).toEqual({
      isMobileSidebarOpen: true,
      toastMessage: '',
      isToastShow: false,
    });
  });

  it('should handle showToast', () => {
    expect(uiReducer(undefined, showToast('Success!'))).toEqual({
      isMobileSidebarOpen: false,
      toastMessage: 'Success!',
      isToastShow: true,
    });
  });

  it('should handle hideToast', () => {
    const state = {
      isMobileSidebarOpen: false,
      toastMessage: 'Success!',
      isToastShow: true,
    };
    expect(uiReducer(state, hideToast())).toEqual({
      isMobileSidebarOpen: false,
      toastMessage: 'Success!',
      isToastShow: false,
    });
  });
});
