import { notificationController } from '@/server/controllers/NotificationController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return notificationController.getNotifications(request);
  })
);

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return notificationController.markAllAsRead(request);
  })
);

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return notificationController.clearAll(request);
  })
);
