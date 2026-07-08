import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '../config/database';
import { logger } from '../../lib/logger';

type RouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      await dbConnect();
      return await handler(request, ...args);
    } catch (error: any) {
      logger.error('API Route Error', { 
        url: request.url, 
        method: request.method,
        errorMessage: error.message,
        stack: error.stack 
      });

      if (error.code === 11000) {
        return NextResponse.json(
          { success: false, message: 'Resource already exists', errors: ['A resource with this unique value already exists'] },
          { status: 409 }
        );
      }

      if (error.message === 'Question already exists.' || error.message === 'Category already exists.') {
        return NextResponse.json(
          { success: false, message: error.message, errors: [error.message] },
          { status: 400 }
        );
      }

      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e: any) => e.message);
        return NextResponse.json(
          { success: false, message: 'Validation failed', errors: messages },
          { status: 400 }
        );
      }

      if (error.name === 'CastError') {
        return NextResponse.json(
          { success: false, message: 'Invalid query identifier format', errors: [error.message] },
          { status: 400 }
        );
      }

      const isProd = process.env.NODE_ENV === 'production';
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || 'Internal Server Error', 
          errors: isProd ? ['An unexpected error occurred on the server'] : [error.stack || error.message] 
        },
        { status: 500 }
      );
    }
  };
}
