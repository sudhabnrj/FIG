import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId | string;
  entityType: 'question' | 'answer';
  entityId: mongoose.Types.ObjectId | string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entityType: { type: String, enum: ['question', 'answer'], required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    category: { type: String, default: 'General' },
  },
  { timestamps: true }
);

// Ensure a user cannot bookmark the same question or answer twice
BookmarkSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });

export const Bookmark =
  mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
