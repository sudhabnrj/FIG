import { Category, ICategory } from '../models/Category';

export class CategoryRepository {
  async findAll(): Promise<ICategory[]> {
    return Category.find().sort({ order: 1 }).exec();
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return Category.findOne({ slug }).exec();
  }

  async create(data: Partial<ICategory>): Promise<ICategory> {
    return Category.create(data);
  }
}

export const categoryRepository = new CategoryRepository();
