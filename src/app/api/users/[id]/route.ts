import { userController } from '@/server/controllers/UserController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const PATCH = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return userController.updateUser(request, { params });
  }, ['admin', 'super_admin'])
);

export const PUT = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return userController.resetUserPassword(request, { params });
  }, ['admin', 'super_admin'])
);

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return userController.deleteUser(request, { params });
  }, ['admin', 'super_admin'])
);
