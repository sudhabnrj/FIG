import { combineReducers } from '@reduxjs/toolkit';
import questionsReducer from '../features/questions/questionsSlice';
import categoriesReducer from '../features/categories/categoriesSlice';
import searchReducer from '../features/search/searchSlice';
import themeReducer from '../features/theme/themeSlice';
import uiReducer from '../features/ui/uiSlice';

const rootReducer = combineReducers({
  questions: questionsReducer,
  categories: categoriesReducer,
  search: searchReducer,
  theme: themeReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
