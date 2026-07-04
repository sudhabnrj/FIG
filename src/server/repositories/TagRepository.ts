import mongoose from 'mongoose';
import { Tag, ITag } from '../models/Tag';

const TAGS_LIST = [
  { name: 'Prompt Engineering', slug: 'prompt-engineering' },
  { name: 'RAG', slug: 'rag' },
  { name: 'State Management', slug: 'state-management' },
  { name: 'Vite', slug: 'vite' },
  { name: 'Redux', slug: 'redux' },
  { name: 'Performance', slug: 'performance' },
];

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export class TagRepository {
  async findAll(): Promise<ITag[]> {
    if (!isDbConnected()) {
      return TAGS_LIST as any[];
    }
    return Tag.find().sort({ name: 1 }).exec();
  }

  async findBySlug(slug: string): Promise<ITag | null> {
    if (!isDbConnected()) {
      const tag = TAGS_LIST.find((t) => t.slug === slug);
      return tag ? (tag as any) : null;
    }
    return Tag.findOne({ slug }).exec();
  }

  async create(data: Partial<ITag>): Promise<ITag> {
    if (!isDbConnected()) {
      throw new Error('Database is offline. Read-only fallback active.');
    }
    return Tag.create(data);
  }
}

export const tagRepository = new TagRepository();
