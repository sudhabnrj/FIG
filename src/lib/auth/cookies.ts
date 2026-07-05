export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict';
  path: string;
  maxAge: number;
}

export const getCookieOptions = (
  type: 'access' | 'refresh',
  isProd: boolean
): CookieOptions => {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: type === 'access' ? 'lax' : 'strict',
    path: '/',
    maxAge: type === 'access' ? ACCESS_TOKEN_MAX_AGE : REFRESH_TOKEN_MAX_AGE,
  };
};
