import { NextRequest } from 'next/server';
import { categoryController } from '../../../../../server/controllers/CategoryController';
import { withErrorHandler } from '../../../../../server/middlewares/errorHandler';

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: { slug: string } }) => {
  return categoryController.getCategoryBySlug(params.slug);
});
