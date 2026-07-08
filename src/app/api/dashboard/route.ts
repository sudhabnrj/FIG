import { dashboardController } from '@/server/controllers/DashboardController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return dashboardController.getMetrics(request);
  }, ['user', 'moderator', 'admin', 'super_admin'])
);
