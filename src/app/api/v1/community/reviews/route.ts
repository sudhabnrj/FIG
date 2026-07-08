import { NextRequest } from 'next/server';
import { communityController } from '@/server/controllers/CommunityController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return communityController.getPendingReviews(request);
  }, ['moderator', 'admin', 'super_admin'])
);

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return communityController.performReview(request);
  }, ['moderator', 'admin', 'super_admin'])
);
