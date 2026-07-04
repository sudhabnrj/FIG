import { NextRequest } from 'next/server';
import { questionController } from '../../../../../server/controllers/QuestionController';
import { withErrorHandler } from '../../../../../server/middlewares/errorHandler';

export const GET = withErrorHandler(async (request: NextRequest, { params }: { params: { slug: string } }) => {
  return questionController.getQuestionBySlug(params.slug);
});
