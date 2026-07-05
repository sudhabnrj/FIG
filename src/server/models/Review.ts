import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewHistory {
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  moderatorId?: mongoose.Types.ObjectId | string;
  notes?: string;
  timestamp: Date;
}

export interface IReview extends Document {
  entityType: 'question' | 'answer' | 'category' | 'tag';
  entityId: mongoose.Types.ObjectId | string;
  moderatorId?: mongoose.Types.ObjectId | string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  notes?: string;
  history: IReviewHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewHistorySchema: Schema = new Schema(
  {
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'needs_revision'], required: true },
    moderatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ReviewSchema: Schema = new Schema(
  {
    entityType: { type: String, enum: ['question', 'answer', 'category', 'tag'], required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    moderatorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_revision'],
      default: 'pending',
      index: true,
    },
    notes: { type: String, default: '' },
    history: { type: [ReviewHistorySchema], default: [] },
  },
  { timestamps: true }
);

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
