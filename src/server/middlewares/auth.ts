import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../services/AuthService';
import { IUser } from '../models/User';

export interface AuthenticatedNextRequest extends NextRequest {
  user: IUser;
}

type ProtectedRouteHandler = (request: AuthenticatedNextRequest, ...args: unknown[]) => Promise<NextResponse>;

type RouteHandler = (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>;

export function withAuth(handler: ProtectedRouteHandler): RouteHandler {
  return async (request: NextRequest, ...args: unknown[]) => {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', errors: ['Access token is missing'] },
        { status: 401 }
      );
    }

    const user = await authService.verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', errors: ['Access token is invalid or expired'] },
        { status: 401 }
      );
    }

    const authRequest = request as AuthenticatedNextRequest;
    authRequest.user = user;

    return handler(authRequest, ...args);
  };
}
