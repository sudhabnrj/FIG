'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { updateUserProfile, fetchMe, clearAuthError } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';

const ProfileForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    dispatch(clearAuthError());
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      // Handle dynamic properties if set
      setBio((user as any).bio || '');
      setLocation((user as any).location || '');
      setWebsite((user as any).website || '');
      setGithub((user as any).github || '');
      setLinkedin((user as any).linkedin || '');
    }
  }, [user]);

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!name.trim()) {
      tempErrors.name = 'Name is required';
    }
    if (avatar && !/^https?:\/\/.+/.test(avatar)) {
      tempErrors.avatar = 'Invalid avatar URL (must start with http:// or https://)';
    }
    if (website && !/^https?:\/\/.+/.test(website)) {
      tempErrors.website = 'Invalid website URL';
    }
    if (github && !/^https?:\/\/.+/.test(github)) {
      tempErrors.github = 'Invalid GitHub URL';
    }
    if (linkedin && !/^https?:\/\/.+/.test(linkedin)) {
      tempErrors.linkedin = 'Invalid LinkedIn URL';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const resultAction = await dispatch(updateUserProfile({
        name,
        avatar,
        bio,
        location,
        website,
        github,
        linkedin
      }));

      if (updateUserProfile.fulfilled.match(resultAction)) {
        dispatch(showToast('Profile updated successfully!'));
      }
    } catch (err) {
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile summary card */}
      <div className="lg:col-span-1 bg-cardBg border border-border-custom rounded-xl p-5 shadow-card flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-border-custom bg-body flex items-center justify-center text-3xl font-bold text-primary">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="absolute bottom-1 right-1 bg-green-500 w-4.5 h-4.5 rounded-full border-2 border-cardBg" title="Online"></span>
        </div>

        <h3 className="text-xl font-bold text-text-primary mb-0.5">{user.name}</h3>
        <p className="text-sm text-text-muted mb-3">@{user.username}</p>

        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {user.role}
          </span>
          <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
            {user.status}
          </span>
        </div>

        <div className="w-full border-t border-border-custom pt-4 text-left space-y-2.5 text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <i className="fas fa-envelope text-text-secondary w-4"></i>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-key text-text-secondary w-4"></i>
            <span>Auth: <strong className="text-text-primary capitalize">{user.provider}</strong></span>
          </div>
          {location && (
            <div className="flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-text-secondary w-4"></i>
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Profile editor form */}
      <div className="lg:col-span-2 bg-cardBg border border-border-custom rounded-xl p-5 md:p-6 shadow-card">
        <h3 className="text-xl font-bold text-text-primary mb-1">
          Profile Settings
        </h3>
        <p className="text-text-muted text-sm mb-6">
          Customize your display profile options
        </p>

        {error && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-body border ${
                  errors.name ? 'border-red-500' : 'border-border-custom'
                } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                placeholder="Full Name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Avatar URL */}
            <div>
              <label htmlFor="avatar" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Avatar URL
              </label>
              <input
                id="avatar"
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-body border ${
                  errors.avatar ? 'border-red-500' : 'border-border-custom'
                } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                placeholder="https://example.com/avatar.jpg"
              />
              {errors.avatar && <p className="text-xs text-red-500 mt-1">{errors.avatar}</p>}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Biography
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm bg-body border border-border-custom rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all resize-none"
              placeholder="Tell the community about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-body border border-border-custom rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                placeholder="City, Country"
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                Personal Website
              </label>
              <input
                id="website"
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-body border ${
                  errors.website ? 'border-red-500' : 'border-border-custom'
                } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && <p className="text-xs text-red-500 mt-1">{errors.website}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GitHub */}
            <div>
              <label htmlFor="github" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                GitHub Profile
              </label>
              <input
                id="github"
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-body border ${
                  errors.github ? 'border-red-500' : 'border-border-custom'
                } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                placeholder="https://github.com/username"
              />
              {errors.github && <p className="text-xs text-red-500 mt-1">{errors.github}</p>}
            </div>

            {/* LinkedIn */}
            <div>
              <label htmlFor="linkedin" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                LinkedIn Profile
              </label>
              <input
                id="linkedin"
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-body border ${
                  errors.linkedin ? 'border-red-500' : 'border-border-custom'
                } rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all`}
                placeholder="https://linkedin.com/in/username"
              />
              {errors.linkedin && <p className="text-xs text-red-500 mt-1">{errors.linkedin}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary-light active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ProfilePage() {
  return (
    <main className="container py-8 px-4 md:px-8 mx-auto flex-1 max-w-5xl">
      <ErrorBoundary fallbackTitle="Profile Settings Error">
        <ProfileForm />
      </ErrorBoundary>
    </main>
  );
}
