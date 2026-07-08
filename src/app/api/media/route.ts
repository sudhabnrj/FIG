import { mediaController } from '@/server/controllers/MediaController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return mediaController.getMedia(request);
  }, ['admin', 'super_admin'])
);

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return mediaController.uploadFile(request);
  })
);
