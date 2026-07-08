import { userController } from '@/server/controllers/UserController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return userController.getUsers(request);
  }, ['admin', 'super_admin'])
);
