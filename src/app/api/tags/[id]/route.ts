import { tagController } from '@/server/controllers/TagController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  async (request, { params }: { params: { id: string } }) => {
    return tagController.getTagById(request, { params });
  }
);

export const PATCH = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return tagController.updateTag(request, { params });
  }, ['admin', 'super_admin'])
);

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return tagController.deleteTag(request, { params });
  }, ['admin', 'super_admin'])
);
