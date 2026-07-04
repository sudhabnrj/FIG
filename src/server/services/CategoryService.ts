import { categoryRepository } from '../repositories/CategoryRepository';
import { ICategory } from '../models/Category';

export class CategoryService {
  async getCategories(): Promise<ICategory[]> {
    return categoryRepository.findAll();
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return categoryRepository.findBySlug(slug);
  }
}

export const categoryService = new CategoryService();
