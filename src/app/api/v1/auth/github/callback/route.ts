import { NextRequest } from 'next/server';
import { authController } from '../../../../../../server/controllers/AuthController';
import { withErrorHandler } from '../../../../../../server/middlewares/errorHandler';

export const GET = withErrorHandler(async (request: NextRequest) => {
  return authController.githubCallback(request);
});
