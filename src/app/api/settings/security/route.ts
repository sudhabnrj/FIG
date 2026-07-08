import { settingsController } from '@/server/controllers/SettingsController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return settingsController.getSecuritySettings(request);
  }, ['admin', 'super_admin'])
);

export const PATCH = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return settingsController.updateSecuritySettings(request);
  }, ['admin', 'super_admin'])
);
