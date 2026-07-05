'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { changeUserPassword, fetchMe, clearAuthError } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

const SettingsForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(fetchMe());
  }, [dispatch]);

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!oldPassword) {
      tempErrors.oldPassword = 'Current password is required';
    }
    if (!newPassword) {
      tempErrors.newPassword = 'New password is required';
    } else {
      if (newPassword.length < 8) {
        tempErrors.newPassword = 'New password must be at least 8 characters long';
      } else if (!/[A-Z]/.test(newPassword)) {
        tempErrors.newPassword = 'Password must contain at least one uppercase letter';
      } else if (!/[a-z]/.test(newPassword)) {
        tempErrors.newPassword = 'Password must contain at least one lowercase letter';
      } else if (!/[0-9]/.test(newPassword)) {
        tempErrors.newPassword = 'Password must contain at least one digit';
      } else if (!/[!@#$%^&*(),.?":{}|<>\-_]/.test(newPassword)) {
        tempErrors.newPassword = 'Password must contain at least one special character';
      }
    }
    if (newPassword !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsChangingPassword(true);
    try {
      const resultAction = await dispatch(changeUserPassword({ oldPassword, newPassword }));
      setIsChangingPassword(false);
      
      if (changeUserPassword.fulfilled.match(resultAction)) {
        dispatch(showToast('Password updated successfully!'));
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        dispatch(showToast(resultAction.payload as string || 'Password change failed'));
      }
    } catch (err) {
      setIsChangingPassword(false);
      console.error(err);
    }
  };

  if (!user && isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-text-muted mb-4">No active session found.</p>
        <button 
          onClick={() => router.push('/login')} 
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Settings Header */}
      <div className="bg-cardBg border border-border-custom rounded-xl p-5 md:p-6 shadow-card">
        <h3 className="text-xl font-bold text-text-primary mb-1">
          Account Preferences
        </h3>
        <p className="text-text-muted text-sm mb-6">
          Manage your connected login configurations
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 bg-body border border-border-custom rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg">
                <i className="fas fa-shield-alt"></i>
              </div>
              <div>
                <p className="font-bold text-text-primary">Login Provider</p>
                <p className="text-text-muted text-xs">Logged in via {user.provider}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-green-500/10 text-green-500 border border-green-500/20">
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-body border border-border-custom rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-lg">
                <i className="fab fa-google"></i>
              </div>
              <div>
                <p className="font-bold text-text-primary">Google Account</p>
                <p className="text-text-muted text-xs">
                  {user.provider === 'google' ? 'Currently primary provider' : 'Not linked'}
                </p>
              </div>
            </div>
            {user.provider === 'google' ? (
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-green-500/10 text-green-500 border border-green-500/20">
                Connected
              </span>
            ) : (
              <a href="/api/v1/auth/google" className="text-xs text-primary font-bold hover:underline">
                Link account
              </a>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 bg-body border border-border-custom rounded-lg text-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-text-primary/10 text-text-primary rounded-full flex items-center justify-center text-lg">
                <i className="fab fa-github"></i>
              </div>
              <div>
                <p className="font-bold text-text-primary">GitHub Account</p>
                <p className="text-text-muted text-xs">
                  {user.provider === 'github' ? 'Currently primary provider' : 'Not linked'}
                </p>
              </div>
            </div>
            {user.provider === 'github' ? (
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-green-500/10 text-green-500 border border-green-500/20">
                Connected
              </span>
            ) : (
              <a href="/api/v1/auth/github" className="text-xs text-primary font-bold hover:underline">
                Link account
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Password reset for local users */}
      {user.provider === 'local' && (
        <div className="bg-cardBg border border-border-custom rounded-xl p-5 md:p-6 shadow-card">
          <h3 className="text-xl font-bold text-text-primary mb-1">
            Change Password
          </h3>
          <p className="text-text-muted text-sm mb-6">
            Ensure your account is using a long, random password to stay secure
          </p>

          {error && (
            <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
            {/* Current Password */}
            <div>
              <label htmlFor="oldPassword" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className={`w-full max-w-md px-3 py-2 text-sm bg-body border ${
                  errors.oldPassword ? 'border-red-500' : 'border-border-custom'
                } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                placeholder="••••••••"
              />
              {errors.oldPassword && <p className="text-xs text-red-500 mt-1">{errors.oldPassword}</p>}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full max-w-md px-3 py-2 text-sm bg-body border ${
                  errors.newPassword ? 'border-red-500' : 'border-border-custom'
                } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                placeholder="••••••••"
              />
              {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full max-w-md px-3 py-2 text-sm bg-body border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-border-custom'
                } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {isChangingPassword ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default function SettingsPage() {
  return (
    <main className="container py-8 px-4 md:px-8 mx-auto flex-1 max-w-3xl">
      <ErrorBoundary fallbackTitle="Account Settings Error">
        <SettingsForm />
      </ErrorBoundary>
    </main>
  );
}
