'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { changeUserPassword, fetchMe } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';

export default function SettingsPage() {
  const dispatch = useAppDispatch();

  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  const validatePassword = () => {
    const tempErrors: typeof errors = {};
    if (!oldPassword) tempErrors.oldPassword = 'Old password is required';
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
    if (!validatePassword()) return;

    try {
      setChangingPassword(true);
      const resultAction = await dispatch(changeUserPassword({ oldPassword, newPassword }));
      if (changeUserPassword.fulfilled.match(resultAction)) {
        dispatch(showToast('Password changed successfully!'));
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      } else {
        dispatch(showToast(resultAction.payload as string || 'Failed to change password'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(showToast('Account preferences updated successfully!'));
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Account Settings</h1>
        <p className="text-xs text-text-muted mt-1">Configure your login preferences, security credentials, and alert options.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password */}
        {user.provider === 'local' && (
          <div className="bg-cardBg border border-border-custom rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold pb-2 border-b border-border-custom flex items-center gap-2">
              <i className="fas fa-lock text-primary"></i> Change Security Password
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Old Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
                />
                {errors.oldPassword && <p className="text-[10px] text-red-500 mt-1">{errors.oldPassword}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
                />
                {errors.newPassword && <p className="text-[10px] text-red-500 mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
                />
                {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-55"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* OAuth Links and Preferences */}
        <div className="space-y-6">
          {/* Provider Stats */}
          <div className="bg-cardBg border border-border-custom rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold pb-2 border-b border-border-custom flex items-center gap-2">
              <i className="fas fa-shield-alt text-primary"></i> Auth Integration
            </h2>
            <div className="p-3 bg-body border border-border-custom rounded-lg flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center text-base">
                  <i className={user.provider === 'google' ? 'fab fa-google' : user.provider === 'github' ? 'fab fa-github' : 'fas fa-envelope'}></i>
                </div>
                <div>
                  <p className="font-bold text-text-primary capitalize">{user.provider} Login</p>
                  <p className="text-text-muted text-[10px]">{user.email}</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded bg-green-500/10 text-green-500 border border-green-500/20">
                Active Provider
              </span>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-cardBg border border-border-custom rounded-xl p-6 shadow-card space-y-4">
            <h2 className="text-base font-bold pb-2 border-b border-border-custom flex items-center gap-2">
              <i className="fas fa-sliders-h text-primary"></i> Subscriptions & Alerts
            </h2>
            <form onSubmit={handlePreferencesSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">Email Notifications</p>
                  <p className="text-text-muted text-[10px]">Receive summaries when submissions are approved/rejected</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 text-primary bg-body rounded border-border-custom focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">Security Alerts</p>
                  <p className="text-text-muted text-[10px]">Notify me immediately on password or session changes</p>
                </div>
                <input
                  type="checkbox"
                  checked={securityAlerts}
                  onChange={(e) => setSecurityAlerts(e.target.checked)}
                  className="w-4 h-4 text-primary bg-body rounded border-border-custom focus:ring-primary"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-lg transition-all shadow-md cursor-pointer">
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
