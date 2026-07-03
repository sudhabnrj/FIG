import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CategoriesState {
  activeCategory: string;
  categoriesOrder: string[];
}

const initialState: CategoriesState = {
  activeCategory: 'ai',
  categoriesOrder: ["AI", "UI / UX", "React", "JavaScript", "Next.js"],
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setActiveCategory(state, action: PayloadAction<string>) {
      state.activeCategory = action.payload;
    },
  },
});

export const { setActiveCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
