'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { registerUser, clearAuthError } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import Link from 'next/link';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profile');
    }
  }, [isAuthenticated, router]);

  const validate = () => {
    const tempErrors: typeof errors = {};
    
    if (!name.trim()) {
      tempErrors.name = 'Full name is required';
    }
    
    if (!username.trim()) {
      tempErrors.username = 'Username is required';
    } else if (username.length < 3 || username.length > 30) {
      tempErrors.username = 'Username must be between 3 and 30 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      tempErrors.username = 'Username can only contain alphanumeric characters and underscores';
    }

    if (!email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address format';
    }

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
    if (!validate()) return;

    try {
      const resultAction = await dispatch(registerUser({ name, username, email, password }));
      if (registerUser.fulfilled.match(resultAction)) {
        setIsSuccess(true);
        dispatch(showToast('Registration successful! Please check your email.'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto p-6 md:p-8 bg-cardBg border border-border-custom rounded-2xl shadow-card backdrop-blur-md text-center">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          <i className="fas fa-check-circle animate-bounce"></i>
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary tracking-tight mb-2">
          Verify Your Email
        </h2>
        <p className="text-text-muted text-sm leading-relaxed mb-6">
          We have sent a verification link to <strong className="text-text-primary">{email}</strong>. 
          Please check your inbox (and spam folder) and click the link to activate your account.
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
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
          Create Account
        </h2>
        <p className="text-text-muted text-sm mt-1.5">
          Join the community and test your skills
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-medium flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <i className="fas fa-user text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm bg-body border ${
                errors.name ? 'border-red-500' : 'border-border-custom'
              } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all`}
              placeholder="John Doe"
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Username
          </label>
          <div className="relative">
            <i className="fas fa-at text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-sm bg-body border ${
                errors.username ? 'border-red-500' : 'border-border-custom'
              } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all`}
              placeholder="johndoe_99"
            />
          </div>
          {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
        </div>

        {/* Email Address */}
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
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Password
          </label>
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
            />
          </div>
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <i className="fas fa-shield-alt text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-sm"></i>
            <input
              id="confirmPassword"
              type="password"
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
          disabled={isLoading}
          className="w-full py-2.5 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner animate-spin"></i>
              <span>Signing Up...</span>
            </>
          ) : (
            <span>Sign Up</span>
          )}
        </button>
      </form>

      {/* Social login divider */}
      <div className="my-6 flex items-center justify-between">
        <span className="w-[30%] h-[1px] bg-border-custom"></span>
        <span className="text-xs font-semibold text-text-muted uppercase">or register with</span>
        <span className="w-[30%] h-[1px] bg-border-custom"></span>
      </div>

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
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Login
        </Link>
      </div>
    </div>
  );
};
