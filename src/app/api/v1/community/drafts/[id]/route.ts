import { NextRequest } from 'next/server';
import { communityController } from '@/server/controllers/CommunityController';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    return communityController.deleteDraft(request, { params });
  })
);
