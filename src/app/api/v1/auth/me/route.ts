import { NextRequest } from 'next/server';
import { authController } from '../../../../../server/controllers/AuthController';
import { withErrorHandler } from '../../../../../server/middlewares/errorHandler';
import { withAuth } from '../../../../../server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: NextRequest & { user: any }) => {
    return authController.me(request);
  })
);
