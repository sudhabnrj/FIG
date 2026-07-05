'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { showToast } from '../../features/ui/uiSlice';
import { useAppDispatch } from '../../hooks/store';

export const ResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Password reset token is missing. Please request a new link.');
    }
  }, [token]);

  const validate = () => {
    const tempErrors: typeof errors = {};
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else {
      if (password.length < 8) {
        tempErrors.password = 'Password must be at least 8 characters long';
      } else if (!/[A-Z]/.test(password)) {
        tempErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(password)) {
        tempErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(password)) {
        tempErrors.password = 'Password must contain at least one digit';
      } else if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(password)) {
        tempErrors.password = 'Password must contain at least one special character';
      }
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Cannot submit. Token is missing.');
      return;
    }
    if (!validate()) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (response.ok) {
        setIsSuccess(true);
        dispatch(showToast('Password reset successfully!'));
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Network error occurred');
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-cardBg border border-border-custom rounded-2xl shadow-card backdrop-blur-md text-center">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i className="fas fa-check-circle animate-bounce"></i>
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
          Password Updated
        </h2>
        <p className="text-text-muted text-sm leading-relaxed mb-6">
          Your password has been reset successfully. You can now log in with your new credentials.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Proceed to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-cardBg border border-border-custom rounded-2xl shadow-card backdrop-blur-md transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          New Password
        </h2>
        <p className="text-text-muted text-sm mt-1.5">
          Enter and confirm your new account password
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            New Password
          </label>
          <div className="relative">
            <i className="fas fa-lock text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            <input
              id="password"
              type="password"
              disabled={!token}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm bg-body border ${
                errors.password ? 'border-red-500' : 'border-border-custom'
              } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <i className="fas fa-shield-alt text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            <input
              id="confirmPassword"
              type="password"
              disabled={!token}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm bg-body border ${
                errors.confirmPassword ? 'border-red-500' : 'border-border-custom'
              } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all`}
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Resetting Password...</span>
            </>
          ) : (
            <span>Reset Password</span>
          )}
        </button>
      </form>
    </div>
  );
};
