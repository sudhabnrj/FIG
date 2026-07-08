import { roleController } from '@/server/controllers/RoleController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return roleController.getRoles(request);
  }, ['admin', 'super_admin'])
);

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return roleController.createRole(request);
  }, ['admin', 'super_admin'])
);
