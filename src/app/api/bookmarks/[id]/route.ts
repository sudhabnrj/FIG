import { bookmarkController } from '@/server/controllers/BookmarkController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return bookmarkController.deleteBookmark(request, { params });
  })
);
