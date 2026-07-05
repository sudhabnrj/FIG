import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './lib/auth/jwt';

const ipCache = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 100;
const WINDOW_MS = 15 * 60 * 1000;

export async function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const pathname = request.nextUrl.pathname;

  let accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // 1. Rate Limiting for API routes
  if (pathname.startsWith('/api/')) {
    const now = Date.now();
    const rateLimitData = ipCache.get(ip);

    if (!rateLimitData || now > rateLimitData.resetTime) {
      ipCache.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else {
      rateLimitData.count += 1;
      if (rateLimitData.count > LIMIT) {
        return NextResponse.json(
          { success: false, message: 'Too many requests', errors: ['Rate limit exceeded. Please try again later.'] },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
            }
          }
        );
      }
    }
  }

  // 2. Route Protection & Token Refresh
  const isProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/settings') || pathname.startsWith('/dashboard');
  const isAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password' || pathname === '/reset-password';

  const jwtSecret = process.env.JWT_SECRET || 'placeholder_jwt_secret_value';
  let isTokenValid = false;
  let decodedUser: any = null;

  if (accessToken) {
    decodedUser = await verifyJwt(accessToken, jwtSecret);
    if (decodedUser) {
      isTokenValid = true;
    }
  }

  // If access token is missing or expired, but we have a refresh token, try to refresh
  if (!isTokenValid && refreshToken) {
    try {
      const refreshResponse = await fetch(new URL('/api/v1/auth/refresh', request.url), {
        method: 'POST',
        headers: {
          Cookie: `refreshToken=${refreshToken}`
        }
      });

      if (refreshResponse.ok) {
        // Success! We refreshed our tokens.
        // We will continue the request but we must attach the new Set-Cookie headers from the refresh response
        const nextResponse = isAuthRoute 
          ? NextResponse.redirect(new URL('/profile', request.url))
          : NextResponse.next();

        const setCookies = refreshResponse.headers.getSetCookie();
        setCookies.forEach((cookie) => {
          nextResponse.headers.append('Set-Cookie', cookie);
        });

        // Set security headers & CORS
        applyHeaders(request, nextResponse);
        return nextResponse;
      }
    } catch (e) {
      console.error('Middleware token refresh error:', e);
    }
  }

  // Redirect guest users accessing protected views
  if (isProtectedRoute && !isTokenValid && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    applyHeaders(request, response);
    return response;
  }

  // Redirect authenticated users accessing auth forms
  if (isAuthRoute && (isTokenValid || refreshToken)) {
    const profileResponse = NextResponse.redirect(new URL('/profile', request.url));
    applyHeaders(request, profileResponse);
    return profileResponse;
  }

  // 3. Security Headers and CORS for all requests
  const response = NextResponse.next();
  applyHeaders(request, response);
  return response;
}

function applyHeaders(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get('origin');
  if (origin && (origin.startsWith('http://localhost:') || origin.startsWith('https://interview-guide'))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.fontawesome.com; font-src 'self' https://fonts.gstatic.com https://use.fontawesome.com; img-src 'self' data:; connect-src 'self';");
}

export const config = {
  // Check rate limits on API and check auth on views/APIs
  matcher: ['/api/:path*', '/profile/:path*', '/profile', '/settings/:path*', '/settings', '/dashboard/:path*', '/dashboard', '/login', '/register', '/forgot-password', '/reset-password'],
};
