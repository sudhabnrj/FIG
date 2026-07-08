import { categoryRepository } from '../repositories/CategoryRepository';
import { ICategory } from '../models/Category';

export class CategoryService {
  async getCategories(): Promise<ICategory[]> {
    return categoryRepository.findAll();
  }

  async getCategoryBySlug(slug: string): Promise<ICategory | null> {
    return categoryRepository.findBySlug(slug);
  }

  async getCategoryById(id: string): Promise<ICategory | null> {
    return categoryRepository.findById(id);
  }

  async createCategory(data: any, createdById?: string): Promise<ICategory> {
    const cleanName = data.name.trim();
    const { Category } = await import('../models/Category');
    const existing = await Category.findOne({
      name: { $regex: new RegExp('^' + cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
    }).exec();

    if (existing) {
      throw new Error('Category already exists.');
    }

    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return categoryRepository.create({
      ...data,
      name: cleanName,
      slug,
      createdBy: createdById,
    });
  }

  async updateCategory(id: string, data: any): Promise<ICategory | null> {
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
    return categoryRepository.update(id, data);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return categoryRepository.delete(id);
  }

  async mergeCategories(sourceId: string, destinationId: string): Promise<void> {
    const sourceCat = await categoryRepository.findById(sourceId);
    const destCat = await categoryRepository.findById(destinationId);
    if (!sourceCat || !destCat) throw new Error('Source or destination category not found');

    const { Question } = await import('../models/Question');
    // Update category name in all questions
    await Question.updateMany({ category: sourceCat.name }, { $set: { category: destCat.name } }).exec();

    // Delete source category
    await categoryRepository.delete(sourceId);
  }
}

export const categoryService = new CategoryService();
