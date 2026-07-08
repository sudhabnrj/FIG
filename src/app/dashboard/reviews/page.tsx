'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { fetchPendingReviews, performReviewAction } from '../../../features/community/communitySlice';
import { showToast } from '../../../features/ui/uiSlice';

export default function ModeratorReviewsPage() {
  const dispatch = useAppDispatch();
  const { pendingReviews, loading, error } = useAppSelector((state) => state.community);

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    dispatch(fetchPendingReviews());
  }, [dispatch]);

  const handleDecision = async (action: 'approved' | 'rejected' | 'needs_revision') => {
    if (!selectedReviewId) return;

    try {
      setReviewing(true);
      const res = await dispatch(performReviewAction({ reviewId: selectedReviewId, action, notes }));
      if (performReviewAction.fulfilled.match(res)) {
        dispatch(showToast(`Content ${action} successfully`));
        setSelectedReviewId(null);
        setNotes('');
        dispatch(fetchPendingReviews());
      } else {
        dispatch(showToast('Moderation action failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error executing action'));
    } finally {
      setReviewing(false);
    }
  };

  const selectedItem = pendingReviews.find((r) => r.review._id === selectedReviewId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Moderation Queue</h1>
        <p className="text-xs text-text-muted mt-1">Review community contributions, add feedback notes, and update statuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Pending List */}
        <div className="lg:col-span-1 bg-cardBg border border-border-custom rounded-xl p-4 shadow-card flex flex-col h-[600px]">
          <h2 className="text-sm font-bold pb-2 border-b border-border-custom flex items-center justify-between mb-4">
            <span>Pending Tasks ({pendingReviews.length})</span>
            {loading && <i className="fas fa-spinner fa-spin text-primary"></i>}
          </h2>

          {pendingReviews.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted">
              <i className="fas fa-check-double text-4xl mb-2 text-success/60"></i>
              <p className="text-sm font-semibold">Moderation queue is empty!</p>
              <p className="text-[10px] mt-1 max-w-[200px]">No pending contributions require actions.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {pendingReviews.map((item) => {
                const isQ = item.review.entityType === 'question';
                const active = selectedReviewId === item.review._id;
                const title = isQ
                  ? (item.details.title || item.details.question.slice(0, 50))
                  : `Answer for: ${item.details.questionId?.title || 'Question'}`;

                return (
                  <button
                    key={item.review._id}
                    onClick={() => { setSelectedReviewId(item.review._id); setNotes(''); }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1.5 cursor-pointer bg-transparent ${
                      active
                        ? 'border-primary bg-primary/5'
                        : 'border-border-custom hover:bg-border-light/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        isQ ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {item.review.entityType}
                      </span>
                      <span className="text-[9px] text-text-muted">
                        {new Date(item.review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-text-primary line-clamp-2">{title}</h3>
                    <p className="text-[10px] text-text-secondary truncate">By: {item.details.authorId?.name || 'Contributor'}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Details View */}
        <div className="lg:col-span-2 bg-cardBg border border-border-custom rounded-xl p-6 shadow-card h-[600px] flex flex-col overflow-hidden">
          {selectedItem ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="pb-4 border-b border-border-custom flex items-center justify-between gap-4">
                <div>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    {selectedItem.review.entityType}
                  </span>
                  <h2 className="text-base font-bold text-text-primary mt-1.5">
                    {selectedItem.review.entityType === 'question'
                      ? selectedItem.details.title
                      : 'Reviewing Answer'}
                  </h2>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    Submitted by: <strong>{selectedItem.details.authorId?.name} (@{selectedItem.details.authorId?.username})</strong>
                  </p>
                </div>
              </div>

              {/* Scrollable Content Preview */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {selectedItem.review.entityType === 'question' ? (
                  <div className="space-y-3 text-xs">
                    <div>
                      <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[9px] mb-1">Concept Summary</h4>
                      <p className="p-3 bg-body border border-border-custom rounded-lg text-text-secondary">{selectedItem.details.summary || 'No summary provided'}</p>
                    </div>

                    <div>
                      <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[9px] mb-1">Question Content</h4>
                      <div className="p-3.5 bg-body border border-border-custom rounded-lg answer-container overflow-x-auto" dangerouslySetInnerHTML={{ __html: selectedItem.details.question }}></div>
                    </div>

                    <div>
                      <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[9px] mb-1">Expected Answer Breakdown</h4>
                      <div className="p-3.5 bg-body border border-border-custom rounded-lg answer-container overflow-x-auto" dangerouslySetInnerHTML={{ __html: selectedItem.details.answer }}></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[9px] mb-1">Category</h4>
                        <span className="capitalize bg-body border border-border-custom px-3 py-1.5 rounded-lg inline-block font-semibold">{selectedItem.details.category}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[9px] mb-1">Difficulty</h4>
                        <span className="capitalize bg-body border border-border-custom px-3 py-1.5 rounded-lg inline-block font-semibold">{selectedItem.details.difficulty}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div>
                      <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[9px] mb-1">Question Reference</h4>
                      <div className="p-3.5 bg-body border border-border-custom rounded-lg font-bold text-text-primary">
                        {selectedItem.details.questionId?.title || 'Question Details Not Available'}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-text-secondary uppercase tracking-wider text-[9px] mb-1">Answer Content</h4>
                      <div className="p-3.5 bg-body border border-border-custom rounded-lg answer-container overflow-x-auto" dangerouslySetInnerHTML={{ __html: selectedItem.details.content }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Pane */}
              <div className="pt-4 border-t border-border-custom space-y-3 bg-cardBg">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Moderator Review Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter review feedback, revision requests, or approval justifications..."
                    rows={2}
                    className="form-control w-full p-2 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleDecision('needs_revision')}
                    disabled={reviewing}
                    className="px-3.5 py-2 border border-yellow-500 text-yellow-600 bg-transparent rounded-lg text-xs font-bold hover:bg-yellow-500/10 cursor-pointer disabled:opacity-55"
                  >
                    Request Revision
                  </button>
                  <button
                    onClick={() => handleDecision('rejected')}
                    disabled={reviewing}
                    className="px-3.5 py-2 border border-red-500 text-red-600 bg-transparent rounded-lg text-xs font-bold hover:bg-red-500/10 cursor-pointer disabled:opacity-55"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDecision('approved')}
                    disabled={reviewing}
                    className="px-4 py-2 bg-success text-white rounded-lg text-xs font-bold hover:bg-success/90 cursor-pointer disabled:opacity-55"
                  >
                    Approve & Publish
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted">
              <i className="fas fa-clipboard-list text-5xl mb-3 text-primary/20"></i>
              <h3 className="text-sm font-bold text-text-primary">No Submission Selected</h3>
              <p className="text-xs max-w-xs mt-1">Select a contribution from the left sidebar moderation tasklist to inspect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
