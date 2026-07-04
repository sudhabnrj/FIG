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
}

export const tagRepository = new TagRepository();
