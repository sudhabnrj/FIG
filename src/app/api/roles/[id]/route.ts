import { roleController } from '@/server/controllers/RoleController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return roleController.getRole(request, { params });
  }, ['admin', 'super_admin'])
);

export const PATCH = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return roleController.updateRole(request, { params });
  }, ['admin', 'super_admin'])
);

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return roleController.deleteRole(request, { params });
  }, ['admin', 'super_admin'])
);
