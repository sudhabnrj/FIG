import mongoose, { Schema, Document } from 'mongoose';

export interface IVersion extends Document {
  entityType: 'question' | 'answer';
  entityId: mongoose.Types.ObjectId | string;
  content: string;
  metadata?: Record<string, any>;
  authorId: mongoose.Types.ObjectId | string;
  versionNumber: number;
  createdAt: Date;
}

const VersionSchema: Schema = new Schema(
  {
    entityType: { type: String, enum: ['question', 'answer'], required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    content: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    versionNumber: { type: Number, required: true },
  },
  { timestamps: true, updatedAt: false } // Only createdAt is needed for versions
);

// Compound index to quickly fetch/sort versions for a specific entity
VersionSchema.index({ entityType: 1, entityId: 1, versionNumber: -1 });

export const Version = mongoose.models.Version || mongoose.model<IVersion>('Version', VersionSchema);
