import { NextRequest } from 'next/server';
import { communityController } from '@/server/controllers/CommunityController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const POST = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    return communityController.createQuestion(request);
  })
);
