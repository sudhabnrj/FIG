import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  isMobileSidebarOpen: boolean;
  toastMessage: string;
  isToastShow: boolean;
}

const initialState: UiState = {
  isMobileSidebarOpen: false,
  toastMessage: '',
  isToastShow: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setMobileSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isMobileSidebarOpen = action.payload;
    },
    showToast(state, action: PayloadAction<string>) {
      state.toastMessage = action.payload;
      state.isToastShow = true;
    },
    hideToast(state) {
      state.isToastShow = false;
    },
  },
});

export const { setMobileSidebarOpen, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
