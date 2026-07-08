import { tagRepository } from '../repositories/TagRepository';
import { ITag } from '../models/Tag';

export class TagService {
  async getTags(): Promise<ITag[]> {
    return tagRepository.findAll();
  }

  async getTagById(id: string): Promise<ITag | null> {
    return tagRepository.findById(id);
  }

  async createTag(data: any): Promise<ITag> {
    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return tagRepository.create({ ...data, slug });
  }

  async updateTag(id: string, data: any): Promise<ITag | null> {
    if (data.name) {
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
    return tagRepository.update(id, data);
  }

  async deleteTag(id: string): Promise<boolean> {
    return tagRepository.delete(id);
  }

  async mergeTags(sourceId: string, destinationId: string): Promise<void> {
    const sourceTag = await tagRepository.findById(sourceId);
    const destTag = await tagRepository.findById(destinationId);
    if (!sourceTag || !destTag) throw new Error('Source or destination tag not found');

    const { Question } = await import('../models/Question');
    // Find questions with source tag
    const questions = await Question.find({ tags: sourceTag.name }).exec();
    for (const q of questions) {
      q.tags = q.tags.filter((t: string) => t !== sourceTag.name);
      if (!q.tags.includes(destTag.name)) {
        q.tags.push(destTag.name);
      }
      await q.save();
    }

    // Delete source tag
    await tagRepository.delete(sourceId);
  }
}

export const tagService = new TagService();
