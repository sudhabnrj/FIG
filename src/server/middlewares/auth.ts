import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../services/AuthService';

type ProtectedRouteHandler = (request: NextRequest & { user: any }, ...args: any[]) => Promise<NextResponse>;

export function withAuth(handler: ProtectedRouteHandler): any {
  return async (request: NextRequest, ...args: any[]) => {
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

    const authRequest = request as any;
    authRequest.user = user;

    return handler(authRequest, ...args);
  };
}
