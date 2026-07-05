import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
  questionId: mongoose.Types.ObjectId | string;
  content: string;
  authorId: mongoose.Types.ObjectId | string;
  status: 'active' | 'inactive' | 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | 'archived';
  reviewStatus: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | 'archived';
  version: number;
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema: Schema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft', 'submitted', 'pending_review', 'approved', 'rejected', 'needs_revision', 'archived'],
      default: 'pending_review',
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: ['draft', 'submitted', 'pending_review', 'approved', 'rejected', 'needs_revision', 'archived'],
      default: 'pending_review',
      index: true,
    },
    version: { type: Number, default: 1 },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Answer = mongoose.models.Answer || mongoose.model<IAnswer>('Answer', AnswerSchema);
