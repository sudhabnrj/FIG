import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../services/AuthService';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { AuthenticatedNextRequest } from '../middlewares/auth';

export class AuthController {
  async register(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body', errors: ['Failed to parse JSON body'] },
        { status: 400 }
      );
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: parsed.error.issues.map(e => e.message) },
        { status: 422 }
      );
    }

    try {
      const user = await authService.register(parsed.data.username, parsed.data.email, parsed.data.password);
      return NextResponse.json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      }, { status: 201 });
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: e.message || 'Registration failed', errors: [e.message || 'Unknown error'] },
        { status: 400 }
      );
    }
  }

  async login(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body', errors: ['Failed to parse JSON body'] },
        { status: 400 }
      );
    }

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: parsed.error.issues.map(e => e.message) },
        { status: 422 }
      );
    }

    try {
      const { user, token } = await authService.login(parsed.data.email, parsed.data.password);
      
      const response = NextResponse.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });

      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: e.message || 'Login failed', errors: [e.message || 'Invalid credentials'] },
        { status: 401 }
      );
    }
  }

  async logout() {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  }

  async me(request: AuthenticatedNextRequest) {
    const user = request.user;
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', errors: ['User details not available'] },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User profile fetched successfully',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  }
}

export const authController = new AuthController();
