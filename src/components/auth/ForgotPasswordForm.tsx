'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '../../features/ui/uiSlice';
import { useAppDispatch } from '../../hooks/store';

export const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address format');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      setIsLoading(false);
      
      if (response.ok) {
        setIsSuccess(true);
        dispatch(showToast('Reset link generated successfully!'));
      } else {
        setError(data.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Network error occurred');
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-cardBg border border-border-custom rounded-2xl shadow-card backdrop-blur-md text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i className="fas fa-paper-plane animate-pulse"></i>
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
          Reset Link Sent
        </h2>
        <p className="text-text-muted text-sm leading-relaxed mb-6">
          If that email address is registered, we have sent a password reset link to <strong className="text-text-primary">{email}</strong>. 
          Please check your inbox (links expire in 15 minutes).
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-cardBg border border-border-custom rounded-2xl shadow-card backdrop-blur-md transition-all duration-300">
      <div className="mb-6">
        <button
          onClick={() => router.push('/login')}
          className="text-text-muted text-sm font-semibold hover:text-text-primary flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <i className="fas fa-arrow-left text-xs"></i>
          <span>Back to Login</span>
        </button>
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          Reset Password
        </h2>
        <p className="text-text-muted text-sm mt-1.5">
          Enter your email to request a reset link
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email */}
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
                error ? 'border-red-500' : 'border-border-custom'
              } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all`}
              placeholder="you@example.com"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <span>Send Reset Link</span>
          )}
        </button>
      </form>
    </div>
  );
};
