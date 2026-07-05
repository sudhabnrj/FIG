import { authController } from '../../../../../server/controllers/AuthController';
import { withErrorHandler } from '../../../../../server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '../../../../../server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return authController.me(request);
  })
);

export const PATCH = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return authController.updateProfile(request);
  })
);

export const PUT = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return authController.changePassword(request);
  })
);
