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
    const userRepoImport = await import('../repositories/UserRepository');
    const userRepository = userRepoImport.userRepository;
    const { verifyJwt } = await import('../../lib/auth/jwt');

    let user: IUser | null = null;
    let newAccessToken: string | null = null;
    let newRefreshToken: string | null = null;

    if (token) {
      user = await authService.verifyAccessToken(token);
    }

    if (!user) {
      const refreshToken = request.cookies.get('refreshToken')?.value;
      if (refreshToken) {
        try {
          const decoded = await verifyJwt(refreshToken, process.env.JWT_REFRESH_SECRET || 'placeholder_jwt_refresh_secret');
          if (decoded && decoded.userId) {
            const potentialUser = await userRepository.findById(decoded.userId);
            if (potentialUser && potentialUser.status === 'active') {
              const refreshed = await authService.refreshTokens(refreshToken);
              user = potentialUser;
              newAccessToken = refreshed.accessToken;
              newRefreshToken = refreshed.refreshToken;
            }
          }
        } catch (e) {
          // Token refresh failed
        }
      }
    }

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

    const response = await handler(authRequest, ...args);

    if (newAccessToken && newRefreshToken) {
      const isProd = process.env.NODE_ENV === 'production';
      const { getCookieOptions } = await import('../../lib/auth/cookies');
      const accessCookie = getCookieOptions('access', isProd);
      const refreshCookie = getCookieOptions('refresh', isProd);

      response.cookies.set('accessToken', newAccessToken, {
        httpOnly: accessCookie.httpOnly,
        secure: accessCookie.secure,
        sameSite: accessCookie.sameSite,
        maxAge: accessCookie.maxAge,
        path: accessCookie.path,
      });

      response.cookies.set('refreshToken', newRefreshToken, {
        httpOnly: refreshCookie.httpOnly,
        secure: refreshCookie.secure,
        sameSite: refreshCookie.sameSite,
        maxAge: refreshCookie.maxAge,
        path: refreshCookie.path,
      });
    }

    return response;
  };
}
