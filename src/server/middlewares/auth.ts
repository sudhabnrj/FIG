import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../services/AuthService';
import { IUser } from '../models/User';

export interface AuthenticatedNextRequest extends NextRequest {
  user: IUser;
}

type ProtectedRouteHandler = (request: AuthenticatedNextRequest, ...args: any[]) => Promise<NextResponse>;

type RouteHandler = (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

export function withAuth(
  handler: ProtectedRouteHandler, 
  allowedRoles?: ('user' | 'moderator' | 'admin' | 'super_admin')[]
): RouteHandler {
  return async (request: NextRequest, ...args: unknown[]) => {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', errors: ['Access token is missing'] },
        { status: 401 }
      );
    }

    const user = await authService.verifyAccessToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', errors: ['Access token is invalid or expired'] },
        { status: 401 }
      );
    }

    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Forbidden', errors: [`Account status is ${user.status}`] },
        { status: 403 }
      );
    }

    // Role-Based Access Control (RBAC) validation
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role as any)) {
        return NextResponse.json(
          { success: false, message: 'Forbidden', errors: ['You do not have permission to access this resource'] },
          { status: 403 }
        );
      }
    }

    const authRequest = request as AuthenticatedNextRequest;
    authRequest.user = user;

    return handler(authRequest, ...args);
  };
}
