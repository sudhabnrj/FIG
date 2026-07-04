import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../server/config/database';
import { withErrorHandler } from '../../../../server/middlewares/errorHandler';

export const GET = withErrorHandler(async () => {
  await dbConnect();
  return NextResponse.json({
    success: true,
    message: 'API is healthy and MongoDB is connected',
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
    },
  });
});
