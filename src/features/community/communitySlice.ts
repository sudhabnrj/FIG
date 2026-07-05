import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface IDraft {
  _id: string;
  userId: string;
  questionId?: string;
  answerId?: string;
  title?: string;
  draftContent: string;
  metadata?: Record<string, any>;
  lastSaved: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  review: {
    _id: string;
    entityType: 'question' | 'answer' | 'category' | 'tag';
    entityId: string;
    moderatorId?: string;
    status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
    notes?: string;
    history: any[];
    createdAt: string;
    updatedAt: string;
  };
  details: any;
}

export interface IVersion {
  _id: string;
  entityType: 'question' | 'answer';
  entityId: string;
  content: string;
  metadata?: Record<string, any>;
  authorId: {
    _id: string;
    name: string;
    username: string;
  };
  versionNumber: number;
  createdAt: string;
}

interface CommunityState {
  drafts: IDraft[];
  pendingReviews: IReview[];
  versionHistory: IVersion[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CommunityState = {
  drafts: [],
  pendingReviews: [],
  versionHistory: [],
  loading: false,
  uploading: false,
  error: null,
  successMessage: null,
};

// --- ASYNC THUNKS ---

export const fetchDrafts = createAsyncThunk(
  'community/fetchDrafts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/community/drafts');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch drafts');
      return data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const saveDraft = createAsyncThunk(
  'community/saveDraft',
  async (draftData: Partial<IDraft>, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/community/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save draft');
      return data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteDraft = createAsyncThunk(
  'community/deleteDraft',
  async (draftId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/community/drafts/${draftId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete draft');
      return draftId;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const submitQuestion = createAsyncThunk(
  'community/submitQuestion',
  async (questionData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/community/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errors?.[0] || data.message || 'Failed to submit question');
      return data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const submitAnswer = createAsyncThunk(
  'community/submitAnswer',
  async (answerData: any, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/community/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answerData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.errors?.[0] || data.message || 'Failed to submit answer');
      return data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchPendingReviews = createAsyncThunk(
  'community/fetchPendingReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/community/reviews');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch review queue');
      return data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const performReviewAction = createAsyncThunk(
  'community/performReviewAction',
  async (reviewData: { reviewId: string; action: 'approved' | 'rejected' | 'needs_revision'; notes?: string }, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to execute review decision');
      return reviewData.reviewId;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchVersionHistory = createAsyncThunk(
  'community/fetchVersionHistory',
  async ({ entityType, entityId }: { entityType: 'question' | 'answer'; entityId: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/v1/community/questions/${entityId}/history`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch version history');
      return data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const restoreVersion = createAsyncThunk(
  'community/restoreVersion',
  async (versionId: string, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/v1/community/questions/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to restore version');
      return data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearCommunityMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.uploading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch drafts
      .addCase(fetchDrafts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDrafts.fulfilled, (state, action: PayloadAction<IDraft[]>) => {
        state.loading = false;
        state.drafts = action.payload;
      })
      .addCase(fetchDrafts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save draft
      .addCase(saveDraft.fulfilled, (state, action: PayloadAction<IDraft>) => {
        const existingIdx = state.drafts.findIndex((d) => d._id === action.payload._id);
        if (existingIdx !== -1) {
          state.drafts[existingIdx] = action.payload;
        } else {
          state.drafts.unshift(action.payload);
        }
      })
      // Delete draft
      .addCase(deleteDraft.fulfilled, (state, action: PayloadAction<string>) => {
        state.drafts = state.drafts.filter((d) => d._id !== action.payload);
      })
      // Submit question
      .addCase(submitQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitQuestion.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Question submitted successfully for review!';
      })
      .addCase(submitQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit answer
      .addCase(submitAnswer.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitAnswer.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = 'Answer submitted successfully for review!';
      })
      .addCase(submitAnswer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch pending reviews
      .addCase(fetchPendingReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingReviews.fulfilled, (state, action: PayloadAction<IReview[]>) => {
        state.loading = false;
        state.pendingReviews = action.payload;
      })
      .addCase(fetchPendingReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Perform review action
      .addCase(performReviewAction.fulfilled, (state, action: PayloadAction<string>) => {
        state.pendingReviews = state.pendingReviews.filter((r) => r.review._id !== action.payload);
        state.successMessage = 'Review decision applied successfully!';
      })
      // Fetch version history
      .addCase(fetchVersionHistory.fulfilled, (state, action: PayloadAction<IVersion[]>) => {
        state.versionHistory = action.payload;
      })
      // Restore version
      .addCase(restoreVersion.fulfilled, (state) => {
        state.successMessage = 'Version restored successfully!';
      });
  },
});

export const { clearCommunityMessages, setUploading } = communitySlice.actions;
export default communitySlice.reducer;
