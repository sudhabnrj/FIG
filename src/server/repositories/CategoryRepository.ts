import mongoose from 'mongoose';
import { Category, ICategory } from '../models/Category';

const CATEGORIES_LIST = [
  { name: 'AI', slug: 'ai', icon: 'fas fa-brain', description: 'Artificial Intelligence and Prompt Engineering', order: 1 },
  { name: 'UI / UX', slug: 'uiux', icon: 'fas fa-pen-nib', description: 'User Interface and User Experience Design', order: 2 },
  { name: 'React JS', slug: 'react', icon: 'fab fa-react', description: 'React JS Frontend Development', order: 3 },
  { name: 'JavaScript', slug: 'javascript', icon: 'fab fa-js', description: 'Core JavaScript and Programming', order: 4 },
  { name: 'Next.js', slug: 'nextjs', icon: 'fas fa-square', description: 'Next.js Modern Web Framework', order: 5 },
];

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

export class CategoryRepository {
  async findAll(): Promise<ICategory[]> {
    if (!isDbConnected()) {
      return CATEGORIES_LIST as any[];
    }
    return Category.find().sort({ order: 1 }).exec();
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    if (!isDbConnected()) {
      const cat = CATEGORIES_LIST.find((c) => c.slug === slug);
      return cat ? (cat as any) : null;
    }
    return Category.findOne({ slug }).exec();
  }

  async create(data: Partial<ICategory>): Promise<ICategory> {
    if (!isDbConnected()) {
      throw new Error('Database is offline. Read-only fallback active.');
    }
    return Category.create(data);
  }
}

export const categoryRepository = new CategoryRepository();
