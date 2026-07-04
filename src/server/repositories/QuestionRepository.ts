import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Question, IQuestion } from '../models/Question';

export interface GetQuestionsFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  featured?: boolean;
  isPublished?: boolean;
  search?: string;
}

export interface GetQuestionsOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function getLocalQuestions(): any[] {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'questions.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load local questions fallback:', e);
  }
  return [];
}

export class QuestionRepository {
  async findById(id: number): Promise<IQuestion | null> {
    if (!isDbConnected()) {
      const local = getLocalQuestions().find((q) => q.id === id);
      return local ? ({
        ...local,
        difficulty: 'medium',
        tags: [local.category.toLowerCase()],
        featured: false,
        order: local.id,
        status: 'active',
        isPublished: true,
      } as any) : null;
    }
    return Question.findOne({ id }).exec();
  }

  async findBySlug(slug: string): Promise<IQuestion | null> {
    if (!isDbConnected()) {
      const local = getLocalQuestions().find((q) => {
        const genSlug = q.question.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
        return genSlug === slug || String(q.id) === slug;
      });
      return local ? ({
        ...local,
        difficulty: 'medium',
        tags: [local.category.toLowerCase()],
        featured: false,
        order: local.id,
        status: 'active',
        isPublished: true,
      } as any) : null;
    }
    return Question.findOne({ slug }).exec();
  }

  async create(data: Partial<IQuestion>): Promise<IQuestion> {
    if (!isDbConnected()) {
      throw new Error('Database is offline. Read-only fallback active.');
    }
    return Question.create(data);
  }

  async count(): Promise<number> {
    if (!isDbConnected()) {
      return getLocalQuestions().length;
    }
    return Question.countDocuments().exec();
  }

  async findAll(
    filters: GetQuestionsFilters = {},
    options: GetQuestionsOptions = {}
  ): Promise<{ questions: IQuestion[]; total: number }> {
    if (!isDbConnected()) {
      console.warn('⚠️ MongoDB is offline. Falling back to local JSON dataset.');
      const localData = getLocalQuestions();
      
      let filtered = localData.map((q: any) => ({
        id: q.id,
        category: q.category,
        question: q.question,
        answer: q.answer,
        diagrams: q.diagrams || [],
        difficulty: 'medium',
        tags: [q.category.toLowerCase()],
        featured: false,
        order: q.id,
        status: 'active',
        isPublished: true,
      }));

      if (filters.category) {
        const cleanCategory = filters.category.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        filtered = filtered.filter(q => q.category.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') === cleanCategory);
      }

      if (filters.difficulty) {
        filtered = filtered.filter(q => q.difficulty === filters.difficulty);
      }

      if (filters.search) {
        const term = filters.search.toLowerCase();
        filtered = filtered.filter(q => q.question.toLowerCase().includes(term) || q.answer.toLowerCase().includes(term));
      }

      if (options.sort) {
        const parts = options.sort.split(':');
        const field = parts[0];
        if (field === 'alphabetical') {
          filtered.sort((a, b) => a.question.localeCompare(b.question));
        } else {
          filtered.sort((a, b) => a.id - b.id);
        }
      }

      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      return {
        questions: filtered.slice(skip, skip + limit) as any[],
        total: filtered.length,
      };
    }

    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.isPublished !== undefined) {
      query.isPublished = filters.isPublished;
    }

    if (filters.category) {
      const cleanCategory = filters.category.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
      if (cleanCategory === 'uiux') {
        query.category = 'UI / UX';
      } else if (cleanCategory === 'ai') {
        query.category = 'AI';
      } else if (cleanCategory === 'react') {
        query.category = 'React';
      } else if (cleanCategory === 'javascript') {
        query.category = 'JavaScript';
      } else if (cleanCategory === 'nextjs') {
        query.category = 'Next.js';
      } else {
        query.category = new RegExp(`^${filters.category}$`, 'i');
      }
    }

    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }

    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }

    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { question: searchRegex },
        { answer: searchRegex }
      ];
    }

    let sortObj: any = { id: 1 };
    if (options.sort) {
      const parts = options.sort.split(':');
      const field = parts[0];
      const order = parts[1] === 'desc' ? -1 : 1;

      if (field === 'newest') {
        sortObj = { createdAt: -1 };
      } else if (field === 'oldest') {
        sortObj = { createdAt: 1 };
      } else if (field === 'alphabetical') {
        sortObj = { question: 1 };
      } else if (field === 'difficulty') {
        sortObj = { difficulty: order };
      } else if (field === 'order') {
        sortObj = { order: order };
      }
    }

    const total = await Question.countDocuments(query).exec();
    const questions = await Question.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .exec();

    return { questions, total };
  }
}

export const questionRepository = new QuestionRepository();
