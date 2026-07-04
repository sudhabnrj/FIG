import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CategoriesState {
  activeCategory: string;
  clickedCategory: string | null;
  categoriesOrder: string[];
}

const initialState: CategoriesState = {
  activeCategory: 'ai',
  clickedCategory: null,
  categoriesOrder: ["AI", "UI / UX", "React", "JavaScript", "Next.js"],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setActiveCategory(state, action: PayloadAction<string>) {
      const allowedCategories = ['ai', 'uiux', 'react', 'javascript', 'nextjs'];
      const cleaned = action.payload.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (allowedCategories.includes(cleaned)) {
        state.activeCategory = cleaned;
      }
    },
    clickCategory(state, action: PayloadAction<string>) {
      const allowedCategories = ['ai', 'uiux', 'react', 'javascript', 'nextjs'];
      const cleaned = action.payload.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      if (allowedCategories.includes(cleaned)) {
        state.clickedCategory = cleaned;
        state.activeCategory = cleaned;
      }
    },
    clearClickedCategory(state) {
      state.clickedCategory = null;
    },
  },
});

export const { setActiveCategory, clickCategory, clearClickedCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
