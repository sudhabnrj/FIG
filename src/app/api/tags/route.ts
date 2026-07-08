import { tagController } from '@/server/controllers/TagController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  async () => {
    return tagController.getTags();
  }
);

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return tagController.createTag(request);
  }, ['admin', 'super_admin'])
);
