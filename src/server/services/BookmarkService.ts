import { bookmarkRepository } from '../repositories/BookmarkRepository';
import { IBookmark } from '../models/Bookmark';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';

export class BookmarkService {
  async addBookmark(userId: string, entityType: 'question' | 'answer', entityId: string, category?: string): Promise<IBookmark> {
    const existing = await bookmarkRepository.findByUserAndEntity(userId, entityType, entityId);
    if (existing) return existing;
    return bookmarkRepository.create({ userId, entityType, entityId, category: category || 'General' });
  }

  async removeBookmark(userId: string, entityType: 'question' | 'answer', entityId: string): Promise<boolean> {
    return bookmarkRepository.deleteByUserAndEntity(userId, entityType, entityId);
  }

  async deleteBookmarkById(id: string): Promise<boolean> {
    return bookmarkRepository.delete(id);
  }

  async getBookmarks(userId: string): Promise<any[]> {
    const bookmarks = await bookmarkRepository.findByUserId(userId);
    const populated = await Promise.all(
      bookmarks.map(async (b) => {
        let details: any = null;
        if (b.entityType === 'question') {
          details = await Question.findById(b.entityId).exec();
        } else if (b.entityType === 'answer') {
          details = await Answer.findById(b.entityId).populate('questionId', 'title question').exec();
        }
        return {
          bookmark: b,
          details,
        };
      })
    );
    return populated.filter((item) => item.details !== null);
  }
}

export const bookmarkService = new BookmarkService();
