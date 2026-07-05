'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { loginUser, clearAuthError } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import Link from 'next/link';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    dispatch(clearAuthError());
    
    // Check for URL errors or redirects
    const oauthError = searchParams.get('error');
    if (oauthError) {
      dispatch(showToast(`OAuth Error: ${oauthError}`));
    }
  }, [dispatch, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/profile';
      router.push(redirect);
      dispatch(showToast('Logged in successfully!'));
    }
  }, [isAuthenticated, router, searchParams, dispatch]);

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address format';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-cardBg border border-border-custom rounded-2xl shadow-card backdrop-blur-md transition-all duration-300">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          Welcome Back
        </h2>
        <p className="text-text-muted text-sm mt-1.5">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <i className="fas fa-envelope text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm bg-body border ${
                errors.email ? 'border-red-500' : 'border-border-custom'
              } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all`}
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-xs text-red-500 mt-1" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-primary font-semibold hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <i className="fas fa-lock text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm bg-body border ${
                errors.password ? 'border-red-500' : 'border-border-custom'
              } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all`}
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-red-500 mt-1" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Signing In...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center justify-between">
        <span className="w-[30%] h-[1px] bg-border-custom"></span>
        <span className="text-xs font-semibold text-text-muted uppercase">or continue with</span>
        <span className="w-[30%] h-[1px] bg-border-custom"></span>
      </div>

      {/* Social login buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href="/api/v1/auth/google"
          className="flex items-center justify-center gap-2 py-2 px-4 border border-border-custom hover:bg-border-light rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <i className="fab fa-google text-red-500"></i>
          <span>Google</span>
        </a>
        <a
          href="/api/v1/auth/github"
          className="flex items-center justify-center gap-2 py-2 px-4 border border-border-custom hover:bg-border-light rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <i className="fab fa-github text-text-primary"></i>
          <span>GitHub</span>
        </a>
      </div>

      <div className="text-center text-sm text-text-muted">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-bold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
};
