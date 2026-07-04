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

export class QuestionRepository {
  async findById(id: number): Promise<IQuestion | null> {
    return Question.findOne({ id }).exec();
  }

  async findBySlug(slug: string): Promise<IQuestion | null> {
    return Question.findOne({ slug }).exec();
  }

  async create(data: Partial<IQuestion>): Promise<IQuestion> {
    return Question.create(data);
  }

  async count(): Promise<number> {
    return Question.countDocuments().exec();
  }

  async findAll(
    filters: GetQuestionsFilters = {},
    options: GetQuestionsOptions = {}
  ): Promise<{ questions: IQuestion[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const skip = (page - 1) * limit;

    const query: mongoose.QueryFilter<IQuestion> = {};

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
        const escapedCategory = filters.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.category = new RegExp(`^${escapedCategory}$`, 'i');
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
      const escapedSearch = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query.$or = [
        { question: searchRegex },
        { answer: searchRegex }
      ];
    }

    let sortObj: Record<string, 1 | -1> = { id: 1 };
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
