import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId | string;
  unused: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema: Schema = new Schema(
  {
    filename: { type: String, required: true },
    filepath: { type: String, required: true, unique: true, index: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    unused: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Media =
  mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
