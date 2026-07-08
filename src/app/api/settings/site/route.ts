import { settingsController } from '@/server/controllers/SettingsController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return settingsController.getSiteSettings(request);
  })
);

export const PATCH = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return settingsController.updateSiteSettings(request);
  }, ['admin', 'super_admin'])
);
