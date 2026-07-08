import { Bookmark, IBookmark } from '../models/Bookmark';

export class BookmarkRepository {
  async findById(id: string): Promise<IBookmark | null> {
    return Bookmark.findById(id).exec();
  }

  async findByUserAndEntity(userId: string, entityType: 'question' | 'answer', entityId: string): Promise<IBookmark | null> {
    return Bookmark.findOne({ userId, entityType, entityId }).exec();
  }

  async findByUserId(userId: string): Promise<IBookmark[]> {
    return Bookmark.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async create(data: Partial<IBookmark>): Promise<IBookmark> {
    return Bookmark.create(data);
  }

  async delete(id: string): Promise<boolean> {
    const res = await Bookmark.findByIdAndDelete(id).exec();
    return res !== null;
  }

  async deleteByUserAndEntity(userId: string, entityType: 'question' | 'answer', entityId: string): Promise<boolean> {
    const res = await Bookmark.findOneAndDelete({ userId, entityType, entityId }).exec();
    return res !== null;
  }
}

export const bookmarkRepository = new BookmarkRepository();
