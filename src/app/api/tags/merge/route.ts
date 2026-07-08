import { tagController } from '@/server/controllers/TagController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return tagController.mergeTags(request);
  }, ['admin', 'super_admin'])
);
