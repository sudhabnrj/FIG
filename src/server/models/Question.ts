import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
  id: number;
  category: string;
  question: string;
  answer?: string;
  diagrams: string[];
  title?: string;
  slug?: string;
  subCategory?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  featured: boolean;
  order: number;
  status: 'active' | 'inactive' | 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | 'archived';
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Community fields
  summary?: string;
  authorId?: mongoose.Types.ObjectId | string;
  reviewStatus?: 'draft' | 'submitted' | 'pending_review' | 'approved' | 'rejected' | 'needs_revision' | 'archived';
  version?: number;
  attachments?: string[];
}

const QuestionSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    category: { type: String, required: true, index: true },
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    diagrams: { type: [String], default: [] },
    title: { type: String },
    slug: { type: String, index: true },
    subCategory: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    tags: { type: [String], default: [], index: true },
    featured: { type: Boolean, default: false, index: true },
    order: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'draft', 'submitted', 'pending_review', 'approved', 'rejected', 'needs_revision', 'archived'], 
      default: 'active', 
      index: true 
    },
    isPublished: { type: Boolean, default: true, index: true },
    
    // Community additions
    summary: { type: String, default: '' },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    reviewStatus: { 
      type: String, 
      enum: ['draft', 'submitted', 'pending_review', 'approved', 'rejected', 'needs_revision', 'archived'], 
      default: 'approved', 
      index: true 
    },
    version: { type: Number, default: 1 },
    attachments: { type: [String], default: [] },
  },
  { timestamps: true }
);

QuestionSchema.pre('validate', function (this: IQuestion) {
  const q = this;
  if (!q.title && q.question) {
    q.title = q.question.length > 60 ? q.question.slice(0, 57) + '...' : q.question;
  }
  if (!q.slug && q.question) {
    q.slug = q.question
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
  }
});

export const Question = mongoose.models.Question || mongoose.model<IQuestion>('Question', QuestionSchema);
