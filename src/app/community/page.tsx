'use client';

import React, { useEffect } from 'react';
import Link from 'react-redux'; // Wait! Next link should be used!
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { fetchDrafts, fetchPendingReviews, clearCommunityMessages } from '../../features/community/communitySlice';
import LinkNext from 'next/link';

export default function CommunityDashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { drafts, pendingReviews, loading, error, successMessage } = useAppSelector(
    (state) => state.community
  );

  useEffect(() => {
    dispatch(fetchDrafts());
    if (user && ['moderator', 'admin', 'super_admin'].includes(user.role)) {
      dispatch(fetchPendingReviews());
    }
    return () => {
      dispatch(clearCommunityMessages());
    };
  }, [dispatch, user]);

  const isModerator = user && ['moderator', 'admin', 'super_admin'].includes(user.role);

  return (
    <div className="min-h-screen bg-bg-body py-10 px-4 md:px-8 text-text-primary">
      <div className="max-w-6xl mx-auto">
        {/* Header banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 p-8 rounded-2xl bg-gradient-to-r from-color-primary to-color-lavender text-white shadow-card">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Community Contribution Portal</h1>
            <p className="text-white/80 max-w-xl">
              Collaborate and contribute to the interview preparation catalog. Create questions, provide high-quality answers, and review others&apos; contributions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkNext
              href="/community/questions/create"
              className="px-5 py-3 bg-white text-color-primary hover:bg-border-light font-bold rounded-xl shadow transition-all hover:scale-105 active:scale-95 text-sm"
            >
              <i className="fas fa-plus-circle mr-2"></i> Contribute Question
            </LinkNext>
            {isModerator && (
              <LinkNext
                href="/community/review"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all hover:scale-105 active:scale-95 text-sm"
              >
                <i className="fas fa-clipboard-check mr-2"></i> Review Queue ({pendingReviews.length})
              </LinkNext>
            )}
          </div>
        </div>

        {/* Message states */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-color-success/15 border border-color-success/30 text-color-success flex items-center gap-3 text-sm">
            <i className="fas fa-check-circle text-lg"></i>
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center gap-3 text-sm">
            <i className="fas fa-exclamation-circle text-lg"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Main section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Info & instructions */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-bg-card border border-border-color shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <i className="fas fa-book-open text-color-primary"></i> Guidelines
              </h2>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-color-primary font-bold">1.</span>
                  <span>Keep description content clear, comprehensive, and formatting-rich.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-color-primary font-bold">2.</span>
                  <span>Validate all expectations and code blocks using inline editors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-color-primary font-bold">3.</span>
                  <span>All contributions go to moderation review and require approval to publish.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-color-primary font-bold">4.</span>
                  <span>Use clean markdown structures for questions, answers, and tags.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-bg-card border border-border-color shadow-sm">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <i className="fas fa-shield-alt text-color-accent"></i> Workflow Security
              </h2>
              <p className="text-xs text-text-muted leading-relaxed">
                We value quality first. Anonymous contributions are restricted. Every update creates a new file version in the changelog, and is protected with role-based checks.
              </p>
            </div>
          </div>

          {/* Right panel: Active drafts & contributions */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="p-6 rounded-2xl bg-bg-card border border-border-color shadow-sm min-h-[300px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <i className="fas fa-edit text-color-primary"></i> Active Drafts ({drafts.length})
                </h2>
                {loading && <i className="fas fa-spinner fa-spin text-color-primary"></i>}
              </div>

              {drafts.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-center text-text-muted border-2 border-dashed border-border-color rounded-xl p-4">
                  <i className="fas fa-folder-open text-3xl mb-3 text-text-muted/60"></i>
                  <p className="text-sm font-semibold">No active drafts found</p>
                  <p className="text-xs max-w-xs mt-1">Start contributing questions or answers. Your changes will autosave automatically.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {drafts.map((draft) => (
                    <div
                      key={draft._id}
                      className="p-4 rounded-xl border border-border-color hover:border-color-primary dark:hover:border-border-hover bg-bg-body/50 transition-all flex flex-col justify-between gap-3 group"
                    >
                      <div>
                        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-color-primary transition-colors">
                          {draft.title || 'Untitled Draft'}
                        </h3>
                        <p className="text-xs text-text-muted mt-1">
                          Last saved: {new Date(draft.lastSaved).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <LinkNext
                          href="/community/questions/create"
                          className="text-xs text-color-primary dark:text-indigo-400 font-bold hover:underline"
                        >
                          Resume Draft <i className="fas fa-chevron-right ml-1"></i>
                        </LinkNext>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
