import { NextRequest } from 'next/server';
import { authController } from '../../../../../server/controllers/AuthController';
import { withErrorHandler } from '../../../../../server/middlewares/errorHandler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  return authController.refresh(request);
});
