'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { updateUserProfile, fetchMe } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';

export default function ProfileManagementPage() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experience, setExperience] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
      setCoverImage((user as any).coverImage || '');
      setBio((user as any).bio || '');
      setLocation((user as any).location || '');
      setWebsite((user as any).website || '');
      setGithub((user as any).github || '');
      setLinkedin((user as any).linkedin || '');
      setExperience((user as any).experience || '');
      if ((user as any).skills && Array.isArray((user as any).skills)) {
        setSkillsInput((user as any).skills.join(', '));
      } else {
        setSkillsInput('');
      }
    }
  }, [user]);

  const validate = () => {
    const tempErrors: typeof errors = {};
    if (!name.trim()) tempErrors.name = 'Name is required';
    if (avatar && !/^https?:\/\/.+/.test(avatar) && !avatar.startsWith('/')) {
      tempErrors.avatar = 'Invalid avatar URL path';
    }
    if (coverImage && !/^https?:\/\/.+/.test(coverImage) && !coverImage.startsWith('/')) {
      tempErrors.coverImage = 'Invalid cover image URL path';
    }
    if (website && !/^https?:\/\/.+/.test(website)) tempErrors.website = 'Invalid website URL';
    if (github && !/^https?:\/\/.+/.test(github)) tempErrors.github = 'Invalid GitHub URL';
    if (linkedin && !/^https?:\/\/.+/.test(linkedin)) tempErrors.linkedin = 'Invalid LinkedIn URL';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const skillsArray = skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const resultAction = await dispatch(
        updateUserProfile({
          name,
          avatar,
          bio,
          location,
          website,
          github,
          linkedin,
          skills: skillsArray,
          experience,
          coverImage,
        } as any)
      );

      if (updateUserProfile.fulfilled.match(resultAction)) {
        dispatch(showToast('Profile settings updated successfully!'));
      } else {
        dispatch(showToast('Failed to save profile modifications'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Profile Management</h1>
        <p className="text-xs text-text-muted mt-1">Configure your personal information, developer portfolio links, and skills cards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Preview */}
        <div className="lg:col-span-1 bg-cardBg border border-border-custom rounded-xl p-6 shadow-card flex flex-col items-center text-center self-start">
          <div className="relative w-full h-32 rounded-lg bg-indigo-500/10 border border-border-custom overflow-hidden mb-4">
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20"></div>
            )}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
              <div className="w-20 h-20 rounded-full border-4 border-cardBg bg-body overflow-hidden flex items-center justify-center font-bold text-primary text-xl">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="text-lg font-bold text-text-primary">{name || user.name}</h3>
            <p className="text-xs text-text-muted">@{user.username}</p>
          </div>

          {bio && <p className="text-xs text-text-secondary mt-3 italic">&ldquo;{bio}&rdquo;</p>}

          <div className="w-full border-t border-border-custom mt-4 pt-4 text-left space-y-2 text-xs text-text-secondary">
            {location && (
              <div className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-primary w-4 text-center"></i>
                <span>{location}</span>
              </div>
            )}
            {experience && (
              <div className="flex items-center gap-2">
                <i className="fas fa-briefcase text-primary w-4 text-center"></i>
                <span>{experience}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-2">
                <i className="fas fa-globe text-primary w-4 text-center"></i>
                <a href={website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{website}</a>
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Editor Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-cardBg border border-border-custom rounded-xl p-6 shadow-card space-y-4">
          <h2 className="text-base font-bold pb-2 border-b border-border-custom">Profile Editor</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Avatar URL</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
              {errors.avatar && <p className="text-[10px] text-red-500 mt-1">{errors.avatar}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Cover Image URL</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.png"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
              {errors.coverImage && <p className="text-[10px] text-red-500 mt-1">{errors.coverImage}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Skills (comma-separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g. React, Next.js, Node.js"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Experience Level</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer (5 years)"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Personal Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://mywebsite.com"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
              {errors.website && <p className="text-[10px] text-red-500 mt-1">{errors.website}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">GitHub Profile</label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/myusername"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
              {errors.github && <p className="text-[10px] text-red-500 mt-1">{errors.github}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">LinkedIn Profile</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/myusername"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary"
              />
              {errors.linkedin && <p className="text-[10px] text-red-500 mt-1">{errors.linkedin}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-55"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
