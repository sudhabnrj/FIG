import { roleController } from '@/server/controllers/RoleController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return roleController.getPermissions(request);
  }, ['admin', 'super_admin'])
);
