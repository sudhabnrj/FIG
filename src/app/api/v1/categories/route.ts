import { NextRequest } from 'next/server';
import { categoryController } from '../../../../server/controllers/CategoryController';
import { withErrorHandler } from '../../../../server/middlewares/errorHandler';

export const GET = withErrorHandler(async () => {
  return categoryController.getCategories();
});
