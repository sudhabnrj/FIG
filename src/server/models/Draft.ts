import mongoose, { Schema, Document } from 'mongoose';

export interface IDraft extends Document {
  userId: mongoose.Types.ObjectId | string;
  questionId?: mongoose.Types.ObjectId | string;
  answerId?: mongoose.Types.ObjectId | string;
  title?: string;
  draftContent: string;
  metadata?: Record<string, any>;
  lastSaved: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DraftSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', index: true },
    answerId: { type: Schema.Types.ObjectId, ref: 'Answer', index: true },
    title: { type: String, default: '' },
    draftContent: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    lastSaved: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Draft = mongoose.models.Draft || mongoose.model<IDraft>('Draft', DraftSchema);
