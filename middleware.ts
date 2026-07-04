import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ipCache = new Map<string, { count: number; resetTime: number }>();
const LIMIT = 100;
const WINDOW_MS = 15 * 60 * 1000;

export function middleware(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  if (request.nextUrl.pathname.startsWith('/api/')) {
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

  const response = NextResponse.next();

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

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
