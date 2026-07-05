import { NextRequest, NextResponse } from 'next/server';
import { authService } from '../services/AuthService';
import { userRepository } from '../repositories/UserRepository';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../validators/auth.validator';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { getCookieOptions } from '../../lib/auth/cookies';
import { env } from '../config/env';

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
      const user = await authService.register(
        parsed.data.name, 
        parsed.data.username, 
        parsed.data.email, 
        parsed.data.password
      );
      
      return NextResponse.json({
        success: true,
        message: 'Registration successful. A verification link has been sent to your email.',
        data: {
          id: user._id,
          name: user.name,
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

  async verifyEmail(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required', errors: ['Token missing'] },
        { status: 400 }
      );
    }

    try {
      const user = await authService.verifyEmail(token);
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully. You can now log in.',
        data: {
          email: user.email,
          isVerified: user.isVerified
        }
      });
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: e.message || 'Email verification failed', errors: [e.message || 'Unknown error'] },
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
      const { user, accessToken, refreshToken } = await authService.login(parsed.data.email, parsed.data.password);
      
      const response = NextResponse.json({
        success: true,
        message: 'Logged in successfully',
        data: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });

      const isProd = env.NODE_ENV === 'production';
      const accessCookie = getCookieOptions('access', isProd);
      const refreshCookie = getCookieOptions('refresh', isProd);

      response.cookies.set('accessToken', accessToken, {
        httpOnly: accessCookie.httpOnly,
        secure: accessCookie.secure,
        sameSite: accessCookie.sameSite,
        maxAge: accessCookie.maxAge,
        path: accessCookie.path,
      });

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: refreshCookie.httpOnly,
        secure: refreshCookie.secure,
        sameSite: refreshCookie.sameSite,
        maxAge: refreshCookie.maxAge,
        path: refreshCookie.path,
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

    response.cookies.set('accessToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return response;
  }

  async refresh(request: NextRequest) {
    const token = request.cookies.get('refreshToken')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Refresh token is missing', errors: ['Token missing'] },
        { status: 401 }
      );
    }

    try {
      const { accessToken, refreshToken } = await authService.refreshTokens(token);
      
      const response = NextResponse.json({
        success: true,
        message: 'Tokens refreshed successfully',
      });

      const isProd = env.NODE_ENV === 'production';
      const accessCookie = getCookieOptions('access', isProd);
      const refreshCookie = getCookieOptions('refresh', isProd);

      response.cookies.set('accessToken', accessToken, {
        httpOnly: accessCookie.httpOnly,
        secure: accessCookie.secure,
        sameSite: accessCookie.sameSite,
        maxAge: accessCookie.maxAge,
        path: accessCookie.path,
      });

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: refreshCookie.httpOnly,
        secure: refreshCookie.secure,
        sameSite: refreshCookie.sameSite,
        maxAge: refreshCookie.maxAge,
        path: refreshCookie.path,
      });

      return response;
    } catch (e: any) {
      // Invalidate cookies on invalid refresh token
      const response = NextResponse.json(
        { success: false, message: e.message || 'Token refresh failed', errors: [e.message || 'Invalid refresh token'] },
        { status: 401 }
      );
      response.cookies.set('accessToken', '', { httpOnly: true, maxAge: 0, path: '/' });
      response.cookies.set('refreshToken', '', { httpOnly: true, maxAge: 0, path: '/' });
      return response;
    }
  }

  async forgotPassword(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body', errors: ['Failed to parse JSON body'] },
        { status: 400 }
      );
    }

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: parsed.error.issues.map(e => e.message) },
        { status: 422 }
      );
    }

    try {
      await authService.forgotPassword(parsed.data.email);
      return NextResponse.json({
        success: true,
        message: 'If the email address is registered, a password reset link has been sent.',
      });
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: e.message || 'Failed to send reset link', errors: [e.message || 'Unknown error'] },
        { status: 400 }
      );
    }
  }

  async resetPassword(request: NextRequest) {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body', errors: ['Failed to parse JSON body'] },
        { status: 400 }
      );
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: parsed.error.issues.map(e => e.message) },
        { status: 422 }
      );
    }

    try {
      await authService.resetPassword(parsed.data.token, parsed.data.password);
      return NextResponse.json({
        success: true,
        message: 'Password reset successful. You can now log in with your new password.',
      });
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: e.message || 'Password reset failed', errors: [e.message || 'Unknown error'] },
        { status: 400 }
      );
    }
  }

  async googleRedirect(request?: NextRequest) {
    const clientId = env.GOOGLE_CLIENT_ID;
    const baseUrl = request ? request.nextUrl.origin : env.APP_URL;
    const redirectUri = `${baseUrl}/api/v1/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20profile%20email&state=google_oauth_state`;

    return NextResponse.redirect(googleAuthUrl);
  }

  async googleCallback(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const baseUrl = request.nextUrl.origin;

    if (error) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_code_missing`);
    }

    try {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          code,
          redirect_uri: `${baseUrl}/api/v1/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        throw new Error('Google OAuth access token missing in response');
      }

      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userData = await userResponse.json();
      if (!userData.email) {
        throw new Error('Google user email not supplied by OAuth provider');
      }

      const { user, accessToken, refreshToken } = await authService.handleOAuthLogin('google', {
        id: userData.id,
        name: userData.name || userData.given_name,
        email: userData.email,
        avatar: userData.picture,
      });

      const response = NextResponse.redirect(`${baseUrl}/profile`);
      const isProd = env.NODE_ENV === 'production';
      const accessCookie = getCookieOptions('access', isProd);
      const refreshCookie = getCookieOptions('refresh', isProd);

      response.cookies.set('accessToken', accessToken, {
        httpOnly: accessCookie.httpOnly,
        secure: accessCookie.secure,
        sameSite: accessCookie.sameSite,
        maxAge: accessCookie.maxAge,
        path: accessCookie.path,
      });

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: refreshCookie.httpOnly,
        secure: refreshCookie.secure,
        sameSite: refreshCookie.sameSite,
        maxAge: refreshCookie.maxAge,
        path: refreshCookie.path,
      });

      return response;
    } catch (e: any) {
      console.error('Google OAuth Callback Error:', e);
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(e.message || 'google_oauth_failed')}`);
    }
  }

  async githubRedirect(request?: NextRequest) {
    const clientId = env.GITHUB_CLIENT_ID;
    const baseUrl = request ? request.nextUrl.origin : env.APP_URL;
    const redirectUri = `${baseUrl}/api/v1/auth/github/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=read:user%20user:email&state=github_oauth_state`;

    return NextResponse.redirect(githubAuthUrl);
  }

  async githubCallback(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const baseUrl = request.nextUrl.origin;

    if (error) {
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return NextResponse.redirect(`${baseUrl}/login?error=oauth_code_missing`);
    }

    try {
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'frontend-interview-guide-oauth'
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${baseUrl}/api/v1/auth/github/callback`,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        throw new Error('GitHub OAuth access token missing in response');
      }

      const userResponse = await fetch('https://api.github.com/user', {
        headers: { 
          Authorization: `token ${tokenData.access_token}`,
          'User-Agent': 'frontend-interview-guide-oauth'
        },
      });

      const userData = await userResponse.json();
      
      // Get primary email
      let email = userData.email;
      if (!email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: { 
            Authorization: `token ${tokenData.access_token}`,
            'User-Agent': 'frontend-interview-guide-oauth'
          },
        });
        const emailsData = await emailsResponse.json();
        if (Array.isArray(emailsData)) {
          const primaryEmailObj = emailsData.find(e => e.primary && e.verified);
          if (primaryEmailObj) {
            email = primaryEmailObj.email;
          }
        }
      }

      if (!email) {
        throw new Error('GitHub user email not supplied or verified by OAuth provider');
      }

      const { user, accessToken, refreshToken } = await authService.handleOAuthLogin('github', {
        id: userData.id.toString(),
        name: userData.name || userData.login,
        email,
        avatar: userData.avatar_url,
      });

      const response = NextResponse.redirect(`${baseUrl}/profile`);
      const isProd = env.NODE_ENV === 'production';
      const accessCookie = getCookieOptions('access', isProd);
      const refreshCookie = getCookieOptions('refresh', isProd);

      response.cookies.set('accessToken', accessToken, {
        httpOnly: accessCookie.httpOnly,
        secure: accessCookie.secure,
        sameSite: accessCookie.sameSite,
        maxAge: accessCookie.maxAge,
        path: accessCookie.path,
      });

      response.cookies.set('refreshToken', refreshToken, {
        httpOnly: refreshCookie.httpOnly,
        secure: refreshCookie.secure,
        sameSite: refreshCookie.sameSite,
        maxAge: refreshCookie.maxAge,
        path: refreshCookie.path,
      });

      return response;
    } catch (e: any) {
      console.error('GitHub OAuth Callback Error:', e);
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(e.message || 'github_oauth_failed')}`);
    }
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
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
      },
    });
  }

  async updateProfile(request: AuthenticatedNextRequest) {
    const user = request.user;
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', errors: ['Authentication required'] },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body', errors: ['Failed to parse JSON body'] },
        { status: 400 }
      );
    }

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: parsed.error.issues.map(e => e.message) },
        { status: 422 }
      );
    }

    try {
      // Create flexible dynamic updates
      const updateData: any = {};
      if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
      if (parsed.data.avatar !== undefined) updateData.avatar = parsed.data.avatar;
      
      // Future-ready settings fields are saved in dynamic properties
      if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
      if (parsed.data.website !== undefined) updateData.website = parsed.data.website;
      if (parsed.data.github !== undefined) updateData.github = parsed.data.github;
      if (parsed.data.linkedin !== undefined) updateData.linkedin = parsed.data.linkedin;
      if (parsed.data.location !== undefined) updateData.location = parsed.data.location;

      const updatedUser = await userRepository.update(user._id.toString(), updateData);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser._id,
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          status: updatedUser.status,
        },
      });
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: e.message || 'Profile update failed', errors: [e.message || 'Unknown error'] },
        { status: 400 }
      );
    }
  }

  async changePassword(request: AuthenticatedNextRequest) {
    const user = request.user;
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', errors: ['Authentication required'] },
        { status: 401 }
      );
    }

    if (user.provider !== 'local') {
      return NextResponse.json(
        { success: false, message: 'OAuth accounts cannot update password', errors: ['Method not supported'] },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request body', errors: ['Failed to parse JSON body'] },
        { status: 400 }
      );
    }

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: parsed.error.issues.map(e => e.message) },
        { status: 422 }
      );
    }

    try {
      const isMatch = await user.comparePassword(parsed.data.oldPassword);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Invalid old password', errors: ['Current password did not match'] },
          { status: 400 }
        );
      }

      user.password = parsed.data.newPassword;
      await user.save();

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (e: any) {
      return NextResponse.json(
        { success: false, message: e.message || 'Password update failed', errors: [e.message || 'Unknown error'] },
        { status: 400 }
      );
    }
  }
}

export const authController = new AuthController();
