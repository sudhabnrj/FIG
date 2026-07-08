import { mediaController } from '@/server/controllers/MediaController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return mediaController.deleteFile(request, { params });
  }, ['admin', 'super_admin'])
);
