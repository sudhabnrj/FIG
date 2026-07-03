import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Question } from '../../types';
import { questionsService } from '../../lib/services/questionsService';

interface QuestionsState {
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  expandedCards: number[];
}

const initialState: QuestionsState = {
  questions: [],
  isLoading: false,
  error: null,
  expandedCards: [],
};

export const fetchQuestions = createAsyncThunk(
  'questions/fetchQuestions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await questionsService.fetchQuestions();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to load questions database.');
    }
  }
);

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setQuestions(state, action: PayloadAction<Question[]>) {
      state.questions = action.payload;
    },
    toggleCard(state, action: PayloadAction<number>) {
      const id = action.payload;
      const index = state.expandedCards.indexOf(id);
      if (index > -1) {
        state.expandedCards.splice(index, 1);
      } else {
        state.expandedCards.push(id);
      }
    },
    expandAll(state, action: PayloadAction<number[]>) {
      state.expandedCards = action.payload;
    },
    collapseAll(state) {
      state.expandedCards = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setQuestions, toggleCard, expandAll, collapseAll } = questionsSlice.actions;
export default questionsSlice.reducer;
