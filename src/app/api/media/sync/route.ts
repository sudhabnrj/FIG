import { mediaController } from '@/server/controllers/MediaController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return mediaController.syncUnused(request);
  }, ['admin', 'super_admin'])
);
