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

  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id).exec();
  }

  async update(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await Category.findByIdAndDelete(id).exec();
    return res !== null;
  }
}

export const categoryRepository = new CategoryRepository();
