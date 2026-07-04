import { NextRequest } from 'next/server';
import { authController } from '../../../../../server/controllers/AuthController';
import { withErrorHandler } from '../../../../../server/middlewares/errorHandler';

export const POST = withErrorHandler(async () => {
  return authController.logout();
});
