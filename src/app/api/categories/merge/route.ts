import { categoryController } from '@/server/controllers/CategoryController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return categoryController.mergeCategories(request);
  }, ['admin', 'super_admin'])
);
