import { Tag, ITag } from '../models/Tag';

export class TagRepository {
  async findAll(): Promise<ITag[]> {
    return Tag.find().sort({ name: 1 }).exec();
  }

  async findBySlug(slug: string): Promise<ITag | null> {
    return Tag.findOne({ slug }).exec();
  }

  async create(data: Partial<ITag>): Promise<ITag> {
    return Tag.create(data);
  }

  async findById(id: string): Promise<ITag | null> {
    return Tag.findById(id).exec();
  }

  async update(id: string, data: Partial<ITag>): Promise<ITag | null> {
    return Tag.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await Tag.findByIdAndDelete(id).exec();
    return res !== null;
  }
}

export const tagRepository = new TagRepository();
