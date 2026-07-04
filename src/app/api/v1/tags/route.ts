import { NextRequest } from 'next/server';
import { tagController } from '../../../../server/controllers/TagController';
import { withErrorHandler } from '../../../../server/middlewares/errorHandler';

export const GET = withErrorHandler(async () => {
  return tagController.getTags();
});
