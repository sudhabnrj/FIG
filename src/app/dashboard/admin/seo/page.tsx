'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../hooks/store';
import { showToast } from '../../../../features/ui/uiSlice';

export default function SeoSettingsPage() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [robotsTxt, setRobotsTxt] = useState('');

  const fetchSeoSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings/seo');
      const json = await res.json();
      if (json.success && json.data) {
        setTitle(json.data.title || '');
        setDescription(json.data.description || '');
        setKeywords(json.data.keywords || '');
        setOgImage(json.data.ogImage || '');
        setRobotsTxt(json.data.robotsTxt || '');
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/settings/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          keywords,
          ogImage,
          robotsTxt,
        }),
      });

      const json = await res.json();
      if (json.success) {
        dispatch(showToast('SEO configurations updated successfully!'));
      } else {
        dispatch(showToast(json.errors?.[0] || 'Save failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">SEO Settings</h1>
        <p className="text-xs text-text-muted mt-1">Configure meta tag defaults, social og:image tags, search index rules, and robots.txt.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-cardBg border border-border-custom rounded-xl p-6 shadow-card max-w-2xl space-y-4">
        <h2 className="text-sm font-bold pb-2 border-b border-border-custom">SEO Configuration</h2>

        <div>
          <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Default Meta Title Template</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Frontend Interview Preparation Hub"
            className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Default Meta Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Search engine brief snippet..."
            rows={3}
            className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Meta Keywords (comma-separated)</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. react, typescript, virtual dom, closure"
            className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Default Social Share Image (og:image) URL</label>
          <input
            type="text"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder="https://example.com/banner.png"
            className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Robots.txt Content Rules</label>
          <textarea
            value={robotsTxt}
            onChange={(e) => setRobotsTxt(e.target.value)}
            placeholder="User-agent: *&#10;Allow: /"
            rows={4}
            className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary font-mono"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-border-custom">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer border-0"
          >
            {saving ? 'Saving changes...' : 'Save Meta Configurations'}
          </button>
        </div>
      </form>
    </div>
  );
}
