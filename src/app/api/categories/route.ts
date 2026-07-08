import { categoryController } from '@/server/controllers/CategoryController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  async () => {
    return categoryController.getCategories();
  }
);

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return categoryController.createCategory(request);
  }, ['admin', 'super_admin'])
);
