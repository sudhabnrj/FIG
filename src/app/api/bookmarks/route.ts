import { bookmarkController } from '@/server/controllers/BookmarkController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return bookmarkController.getBookmarks(request);
  })
);

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return bookmarkController.addBookmark(request);
  })
);

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return bookmarkController.removeBookmark(request);
  })
);
