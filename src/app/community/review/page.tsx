'use client';

import React, { useEffect, useState } from 'react';
import LinkNext from 'next/link';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { fetchPendingReviews, performReviewAction, clearCommunityMessages } from '../../../features/community/communitySlice';

export default function ReviewPage() {
  const dispatch = useAppDispatch();
  const { pendingReviews, loading, error, successMessage } = useAppSelector((state) => state.community);
  
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(fetchPendingReviews());
    return () => {
      dispatch(clearCommunityMessages());
    };
  }, [dispatch]);

  const handleAction = async (reviewId: string, action: 'approved' | 'rejected' | 'needs_revision') => {
    const res = await dispatch(performReviewAction({ reviewId, action, notes }));
    if (performReviewAction.fulfilled.match(res)) {
      setSelectedReviewId(null);
      setNotes('');
    }
  };

  const selectedItem = pendingReviews.find((r) => r.review._id === selectedReviewId);

  return (
    <div className="min-h-screen bg-bg-body py-10 px-4 md:px-8 text-text-primary">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <LinkNext href="/community" className="text-sm text-color-primary font-bold hover:underline flex items-center gap-2">
            <i className="fas fa-arrow-left"></i> Back to Community Portal
          </LinkNext>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary flex items-center gap-3">
            <i className="fas fa-clipboard-check text-color-primary"></i> Moderation Queue
          </h1>
          <p className="text-xs text-text-muted mt-1">Review, approve, or request revisions on contributions.</p>
        </div>

        {/* Message states */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-color-success/15 border border-color-success/30 text-color-success flex items-center gap-3 text-sm animate-fade-in">
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

        {/* Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review List */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="p-5 bg-bg-card border border-border-color rounded-2xl shadow-sm min-h-[400px]">
              <h2 className="text-base font-bold mb-4 flex items-center justify-between border-b border-border-color pb-3">
                <span>Pending Tasks ({pendingReviews.length})</span>
                {loading && <i className="fas fa-spinner fa-spin text-color-primary"></i>}
              </h2>

              {pendingReviews.length === 0 ? (
                <div className="h-[250px] flex flex-col items-center justify-center text-center text-text-muted">
                  <i className="fas fa-check-double text-3xl mb-3 text-color-success/60"></i>
                  <p className="text-sm font-semibold">Queue is completely clear!</p>
                  <p className="text-xs max-w-xs mt-1">No pending contributions require moderation.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
                  {pendingReviews.map((item) => {
                    const review = item.review;
                    const details = item.details;
                    const isQuestion = review.entityType === 'question';
                    const active = selectedReviewId === review._id;

                    return (
                      <button
                        key={review._id}
                        type="button"
                        onClick={() => setSelectedReviewId(review._id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                          active
                            ? 'bg-color-primary-light/40 border-color-primary'
                            : 'border-border-color hover:border-text-muted hover:bg-bg-body/40 bg-bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isQuestion
                                ? 'bg-indigo-500/10 text-indigo-500'
                                : 'bg-emerald-500/10 text-emerald-500'
                            }`}
                          >
                            {review.entityType}
                          </span>
                          <span className="text-[10px] text-text-muted font-medium">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm line-clamp-2 text-text-primary">
                          {isQuestion ? details.title : `Answer for: ${details.questionId?.title || 'Question'}`}
                        </h3>
                        <p className="text-xs text-text-secondary truncate">
                          By: {details.authorId?.name || 'Contributor'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions Pane */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {selectedItem ? (
              <div className="p-6 bg-bg-card border border-border-color rounded-2xl shadow-sm flex flex-col gap-6 animate-fade-in">
                {/* Entity Details Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-color pb-4">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-color-primary-light text-color-primary dark:text-indigo-300 text-xs font-bold uppercase tracking-wider">
                      {selectedItem.review.entityType}
                    </span>
                    <h2 className="text-xl font-bold mt-2 text-text-primary">
                      {selectedItem.review.entityType === 'question'
                        ? selectedItem.details.title
                        : `Reviewing Answer`}
                    </h2>
                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
                      <i className="fas fa-user-circle"></i>
                      <span>Submitted by: <strong>{selectedItem.details.authorId?.name} (@{selectedItem.details.authorId?.username})</strong></span>
                    </p>
                  </div>
                </div>

                {/* Entity Content Preview */}
                <div className="flex flex-col gap-4">
                  {selectedItem.review.entityType === 'question' ? (
                    <>
                      {/* Question details grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-bg-body text-xs">
                        <div>
                          <strong className="text-text-muted uppercase tracking-wider text-[10px]">Category</strong>
                          <p className="font-semibold text-sm mt-1">{selectedItem.details.category}</p>
                        </div>
                        <div>
                          <strong className="text-text-muted uppercase tracking-wider text-[10px]">Subcategory</strong>
                          <p className="font-semibold text-sm mt-1">{selectedItem.details.subCategory || 'None'}</p>
                        </div>
                        <div>
                          <strong className="text-text-muted uppercase tracking-wider text-[10px]">Difficulty</strong>
                          <p className="font-semibold text-sm mt-1 capitalize">{selectedItem.details.difficulty}</p>
                        </div>
                        <div>
                          <strong className="text-text-muted uppercase tracking-wider text-[10px]">Tags</strong>
                          <p className="font-semibold text-sm mt-1">
                            {selectedItem.details.tags?.length > 0
                              ? selectedItem.details.tags.join(', ')
                              : 'None'}
                          </p>
                        </div>
                      </div>

                      {/* Summary */}
                      {selectedItem.details.summary && (
                        <div className="flex flex-col gap-1">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted">Summary</h3>
                          <p className="text-sm p-4 rounded-xl border border-border-color bg-bg-body italic">
                            &ldquo;{selectedItem.details.summary}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Question Description */}
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted">Question Description</h3>
                        <div
                          className="p-4 rounded-xl border border-border-color bg-bg-body prose prose-slate dark:prose-invert max-w-none text-sm"
                          dangerouslySetInnerHTML={{ __html: selectedItem.details.question }}
                        />
                      </div>

                      {/* Answer expectation */}
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted">Expected Answer</h3>
                        <div
                          className="p-4 rounded-xl border border-border-color bg-bg-body prose prose-slate dark:prose-invert max-w-none text-sm"
                          dangerouslySetInnerHTML={{ __html: selectedItem.details.answer }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Answer details */}
                      <div className="p-4 rounded-xl bg-bg-body text-xs flex flex-col gap-2">
                        <h4 className="font-bold text-text-muted uppercase text-[10px]">Target Question:</h4>
                        <p className="font-bold text-sm text-color-primary hover:underline">
                          {selectedItem.details.questionId?.title || 'View Question'}
                        </p>
                      </div>

                      {/* Answer Content */}
                      <div className="flex flex-col gap-1">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted">Answer Content</h3>
                        <div
                          className="p-4 rounded-xl border border-border-color bg-bg-body prose prose-slate dark:prose-invert max-w-none text-sm"
                          dangerouslySetInnerHTML={{ __html: selectedItem.details.content }}
                        />
                      </div>
                    </>
                  )}

                  {/* Attachments */}
                  {selectedItem.details.attachments?.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted">Attachments</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedItem.details.attachments.map((url: string, idx: number) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-border-light hover:bg-border-color border border-border-color rounded-lg text-xs font-semibold text-text-secondary"
                          >
                            <i className="fas fa-external-link-alt"></i>
                            <span>Attachment {idx + 1}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-border-color" />

                {/* Feedback notes */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="notes" className="text-sm font-bold text-text-secondary">
                    Reviewer Notes / Feedback (Required for revision request)
                  </label>
                  <textarea
                    id="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter approval details, reasons for rejection, or instructions for revision..."
                    className="px-4 py-3 rounded-xl border border-border-color bg-bg-body focus:ring-2 focus:ring-color-primary focus:outline-none transition-all text-sm w-full resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!notes.trim()) {
                        alert('Please provide reviewer notes explaining the required revisions.');
                        return;
                      }
                      handleAction(selectedItem.review._id, 'needs_revision');
                    }}
                    className="px-4 py-2 border border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10 font-bold rounded-xl text-sm transition-all"
                  >
                    <i className="fas fa-undo mr-1.5"></i> Request Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(selectedItem.review._id, 'rejected')}
                    className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500/10 font-bold rounded-xl text-sm transition-all"
                  >
                    <i className="fas fa-times mr-1.5"></i> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(selectedItem.review._id, 'approved')}
                    className="px-5 py-2.5 bg-color-success hover:bg-emerald-600 text-white font-bold rounded-xl text-sm shadow transition-all hover:scale-105 active:scale-95"
                  >
                    <i className="fas fa-check-circle mr-1.5"></i> Approve & Publish
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center text-text-muted border border-border-color bg-bg-card rounded-2xl p-6">
                <i className="fas fa-mouse-pointer text-4xl mb-4 text-text-muted/40 animate-pulse"></i>
                <p className="text-base font-bold text-text-secondary">No task selected</p>
                <p className="text-xs max-w-sm mt-1">Select a contribution from the moderation queue panel to preview details and execute decisions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
