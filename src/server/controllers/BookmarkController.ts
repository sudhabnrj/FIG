import { NextResponse } from 'next/server';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { bookmarkService } from '../services/BookmarkService';
import { bookmarkValidator } from '../validators/dashboard.validator';

export class BookmarkController {
  async getBookmarks(request: AuthenticatedNextRequest) {
    const userId = request.user._id.toString();
    const bookmarks = await bookmarkService.getBookmarks(userId);
    return NextResponse.json({ success: true, data: bookmarks });
  }

  async addBookmark(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const validated = bookmarkValidator.parse(body);
    const userId = request.user._id.toString();

    const bookmark = await bookmarkService.addBookmark(
      userId,
      validated.entityType,
      validated.entityId,
      validated.category
    );

    return NextResponse.json({ success: true, data: bookmark }, { status: 201 });
  }

  async removeBookmark(request: AuthenticatedNextRequest) {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType') as 'question' | 'answer';
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json({ success: false, errors: ['entityType and entityId are required'] }, { status: 400 });
    }

    const userId = request.user._id.toString();
    const deleted = await bookmarkService.removeBookmark(userId, entityType, entityId);

    return NextResponse.json({ success: deleted });
  }

  async deleteBookmark(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const deleted = await bookmarkService.deleteBookmarkById(params.id);
    return NextResponse.json({ success: deleted });
  }
}

export const bookmarkController = new BookmarkController();
