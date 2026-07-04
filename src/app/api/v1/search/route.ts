import { NextRequest } from 'next/server';
import { questionController } from '../../../../server/controllers/QuestionController';
import { withErrorHandler } from '../../../../server/middlewares/errorHandler';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  if (query) {
    url.searchParams.set('search', query);
  }
  const mutatedRequest = new NextRequest(url.toString(), {
    headers: request.headers,
    method: request.method,
  });
  return questionController.getQuestions(mutatedRequest);
});
