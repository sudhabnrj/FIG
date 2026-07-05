'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { showToast } from '../../features/ui/uiSlice';
import { useAppDispatch } from '../../hooks/store';

export const VerifyEmailStatus: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const effectRan = useRef(false);
  
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    // Avoid double triggering in React StrictMode
    if (effectRan.current) return;
    effectRan.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing. Please request a new verification email.');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`/api/v1/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been verified successfully! Redirecting you to login...');
          dispatch(showToast('Email verified successfully!'));
          
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Network error occurred. Please try again.');
      }
    };

    verify();
  }, [token, router, dispatch]);

  return (
    <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-cardBg border border-border-custom rounded-2xl shadow-card backdrop-blur-md text-center transition-all duration-300">
      {status === 'verifying' && (
        <>
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 text-2xl animate-spin">
            <i className="fas fa-circle-notch"></i>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight mb-2">
            Verifying Email...
          </h2>
          <p className="text-text-muted text-sm leading-relaxed">
            {message}
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-check-circle animate-bounce"></i>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight mb-2">
            Account Activated!
          </h2>
          <p className="text-text-muted text-sm leading-relaxed mb-6">
            {message}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Go to Login
          </button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i className="fas fa-times-circle animate-pulse"></i>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-text-primary tracking-tight mb-2">
            Verification Failed
          </h2>
          <p className="text-text-muted text-sm leading-relaxed mb-6">
            {message}
          </p>
          <button
            onClick={() => router.push('/register')}
            className="px-6 py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Create New Account
          </button>
        </>
      )}
    </div>
  );
};
