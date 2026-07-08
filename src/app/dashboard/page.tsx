'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '../../hooks/store';
import { showToast } from '../../features/ui/uiSlice';

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'Failed to fetch dashboard data');
        }
      } catch (err: any) {
        setError(err.message || 'Network error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/15 border border-red-500/30 text-red-500 rounded-xl flex items-center gap-3">
        <i className="fas fa-exclamation-circle text-xl"></i>
        <span>{error}</span>
      </div>
    );
  }

  const role = user?.role || 'user';

  // --- ADMIN & SUPER ADMIN VIEW ---
  if (role === 'admin' || role === 'super_admin') {
    const stats = data?.stats || {};
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Admin System Console</h1>
          <p className="text-xs text-text-muted mt-1">Real-time overview of users, content databases, and operations metrics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-blue-500/10 text-blue-500 rounded-lg text-2xl">
              <i className="fas fa-users"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Users</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.totalUsers}</h3>
            </div>
          </div>

          <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-2xl">
              <i className="fas fa-question-circle"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Questions</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.totalQuestions}</h3>
            </div>
          </div>

          <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-green-500/10 text-green-500 rounded-lg text-2xl">
              <i className="fas fa-comments"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Answers</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.totalAnswers}</h3>
            </div>
          </div>

          <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-yellow-500/10 text-yellow-500 rounded-lg text-2xl">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Pending Reviews</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.pendingReviews}</h3>
            </div>
          </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Taxonomy & Storage */}
          <div className="md:col-span-1 p-5 bg-cardBg border border-border-custom rounded-xl shadow-card space-y-4">
            <h2 className="text-base font-bold pb-2 border-b border-border-custom flex items-center gap-2">
              <i className="fas fa-hdd text-primary"></i> Taxonomy & Assets
            </h2>
            <div className="space-y-3.5 text-sm text-text-secondary">
              <div className="flex justify-between items-center">
                <span>Categories</span>
                <span className="font-bold text-text-primary">{stats.totalCategories}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tags</span>
                <span className="font-bold text-text-primary">{stats.totalTags}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Library Files</span>
                <span className="font-bold text-text-primary">{stats.mediaFilesCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Media Size</span>
                <span className="font-bold text-text-primary">{(stats.storageUsage / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="md:col-span-2 p-5 bg-cardBg border border-border-custom rounded-xl shadow-card">
            <h2 className="text-base font-bold pb-2 border-b border-border-custom flex items-center gap-2 mb-4">
              <i className="fas fa-bolt text-primary"></i> Administrative Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/dashboard/admin/users" className="flex items-center gap-3 p-3 bg-body hover:bg-border-light border border-border-custom rounded-lg transition-all text-text-primary no-underline font-semibold text-sm">
                <i className="fas fa-users-cog text-blue-500"></i> Manage User Accounts
              </Link>
              <Link href="/dashboard/admin/categories" className="flex items-center gap-3 p-3 bg-body hover:bg-border-light border border-border-custom rounded-lg transition-all text-text-primary no-underline font-semibold text-sm">
                <i className="fas fa-folder-open text-purple-500"></i> Manage Categories
              </Link>
              <Link href="/dashboard/admin/media" className="flex items-center gap-3 p-3 bg-body hover:bg-border-light border border-border-custom rounded-lg transition-all text-text-primary no-underline font-semibold text-sm">
                <i className="fas fa-images text-green-500"></i> Media Library
              </Link>
              <Link href="/dashboard/admin/system" className="flex items-center gap-3 p-3 bg-body hover:bg-border-light border border-border-custom rounded-lg transition-all text-text-primary no-underline font-semibold text-sm">
                <i className="fas fa-cogs text-yellow-500"></i> System Configuration
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MODERATOR VIEW ---
  if (role === 'moderator') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Moderator Overview</h1>
          <p className="text-xs text-text-muted mt-1">Review the community contributions and queue statistics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-yellow-500/10 text-yellow-500 rounded-lg text-2xl">
              <i className="fas fa-hourglass-half"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Pending Decisions</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{data.pendingReviews}</h3>
            </div>
          </div>

          <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-green-500/10 text-green-500 rounded-lg text-2xl">
              <i className="fas fa-check-circle"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Approved Today</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{data.approvedToday}</h3>
            </div>
          </div>

          <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
            <div className="p-3.5 bg-red-500/10 text-red-500 rounded-lg text-2xl">
              <i className="fas fa-times-circle"></i>
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Rejected Today</p>
              <h3 className="text-2xl font-extrabold text-text-primary mt-1">{data.rejectedToday}</h3>
            </div>
          </div>
        </div>

        <div className="p-6 bg-cardBg border border-border-custom rounded-xl shadow-card text-center py-10 space-y-3">
          <i className="fas fa-clipboard-check text-5xl text-primary/40"></i>
          <h3 className="text-lg font-bold text-text-primary">Moderation Queue Portal</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto">Access pending user contributions to approve or reject submissions.</p>
          <Link href="/dashboard/reviews" className="inline-block mt-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-all no-underline">
            Go to Moderation Queue
          </Link>
        </div>
      </div>
    );
  }

  // --- USER DASHBOARD VIEW ---
  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Welcome Back, {user?.name}</h1>
          <p className="text-xs text-text-muted mt-1">Here is a summary of your interview prep contributions and activity.</p>
        </div>
        <Link href="/community/questions/create" className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 no-underline self-start">
          <i className="fas fa-plus"></i> New Question Contribution
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg text-2xl">
            <i className="fas fa-question-circle"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">My Questions</p>
            <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.questions}</h3>
          </div>
        </div>

        <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-lg text-2xl">
            <i className="fas fa-comment-alt"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">My Answers</p>
            <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.answers}</h3>
          </div>
        </div>

        <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg text-2xl">
            <i className="fas fa-edit"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Drafts</p>
            <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.drafts}</h3>
          </div>
        </div>

        <div className="p-5 bg-cardBg border border-border-custom rounded-xl shadow-card flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-2xl">
            <i className="fas fa-bookmark"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Bookmarks</p>
            <h3 className="text-2xl font-extrabold text-text-primary mt-1">{stats.bookmarks}</h3>
          </div>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contributions */}
        <div className="lg:col-span-2 p-5 bg-cardBg border border-border-custom rounded-xl shadow-card">
          <h2 className="text-base font-bold pb-2 border-b border-border-custom flex items-center gap-2 mb-4">
            <i className="fas fa-history text-primary"></i> Recent Contributions
          </h2>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              <p>You have not contributed any content yet.</p>
              <Link href="/community/questions/create" className="text-primary font-semibold hover:underline inline-block mt-2">
                Make your first submission
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border-custom">
              {recentActivity.map((act: any, idx: number) => (
                <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`p-2 rounded text-xs ${act.type === 'question' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                      <i className={`fas ${act.type === 'question' ? 'fa-question' : 'fa-comment'}`}></i>
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-text-primary line-clamp-1">{act.title}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{new Date(act.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    act.status === 'active' || act.status === 'approved'
                      ? 'bg-green-500/15 text-green-600'
                      : act.status === 'pending_review'
                      ? 'bg-yellow-500/15 text-yellow-600'
                      : 'bg-red-500/15 text-red-600'
                  }`}>
                    {act.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shortcuts */}
        <div className="lg:col-span-1 p-5 bg-cardBg border border-border-custom rounded-xl shadow-card space-y-4">
          <h2 className="text-base font-bold pb-2 border-b border-border-custom flex items-center gap-2">
            <i className="fas fa-link text-primary"></i> Quick Links
          </h2>
          <div className="flex flex-col gap-2">
            <Link href="/dashboard/questions" className="flex items-center gap-3 p-3 hover:bg-border-light rounded-lg transition-all text-text-primary no-underline text-sm font-semibold">
              <i className="fas fa-question-circle text-primary w-5 text-center"></i> My Questions List
            </Link>
            <Link href="/dashboard/answers" className="flex items-center gap-3 p-3 hover:bg-border-light rounded-lg transition-all text-text-primary no-underline text-sm font-semibold">
              <i className="fas fa-comment-alt text-primary w-5 text-center"></i> My Answers List
            </Link>
            <Link href="/dashboard/bookmarks" className="flex items-center gap-3 p-3 hover:bg-border-light rounded-lg transition-all text-text-primary no-underline text-sm font-semibold">
              <i className="fas fa-bookmark text-primary w-5 text-center"></i> View Saved Bookmarks
            </Link>
            <Link href="/dashboard/notifications" className="flex items-center gap-3 p-3 hover:bg-border-light rounded-lg transition-all text-text-primary no-underline text-sm font-semibold">
              <i className="fas fa-bell text-primary w-5 text-center"></i> Notification Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
