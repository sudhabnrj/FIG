import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  questionCount: number;
  createdBy?: mongoose.Types.ObjectId | string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
