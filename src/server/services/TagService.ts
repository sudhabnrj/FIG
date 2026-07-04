import { tagRepository } from '../repositories/TagRepository';
import { ITag } from '../models/Tag';

export class TagService {
  async getTags(): Promise<ITag[]> {
    return tagRepository.findAll();
  }
}

export const tagService = new TagService();
