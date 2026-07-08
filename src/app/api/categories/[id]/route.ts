import { categoryController } from '@/server/controllers/CategoryController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  async (request, { params }: { params: { id: string } }) => {
    return categoryController.getCategoryById(request, { params });
  }
);

export const PATCH = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return categoryController.updateCategory(request, { params });
  }, ['admin', 'super_admin'])
);

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return categoryController.deleteCategory(request, { params });
  }, ['admin', 'super_admin'])
);
