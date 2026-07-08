'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../../hooks/store';
import { fetchDrafts, deleteDraft } from '../../../features/community/communitySlice';
import { showToast } from '../../../features/ui/uiSlice';

export default function DraftsPage() {
  const dispatch = useAppDispatch();
  const { drafts, loading } = useAppSelector((state) => state.community);

  useEffect(() => {
    dispatch(fetchDrafts());
  }, [dispatch]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to discard this draft?')) return;
    const res = await dispatch(deleteDraft(id));
    if (deleteDraft.fulfilled.match(res)) {
      dispatch(showToast('Draft discarded successfully'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">My Drafts</h1>
          <p className="text-xs text-text-muted mt-1">Pick up where you left off or clear out unfinished contributions.</p>
        </div>
        <Link href="/community/questions/create" className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 no-underline self-start">
          <i className="fas fa-plus"></i> New Draft
        </Link>
      </div>

      <div className="bg-cardBg border border-border-custom rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <i className="fas fa-file-signature text-4xl mb-3 text-primary/30"></i>
            <p className="text-sm font-semibold">No drafts found</p>
            <p className="text-xs mt-1">Any questions or answers you start will automatically save here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead className="bg-body border-b border-border-custom text-xs font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="p-4">Title / Concept</th>
                  <th className="p-4">Entity Type</th>
                  <th className="p-4">Last Saved</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {drafts.map((d) => {
                  const isAnswer = d.answerId !== undefined || d.metadata?.answer !== undefined;
                  return (
                    <tr key={d._id} className="hover:bg-border-light/20 transition-all">
                      <td className="p-4 font-semibold">
                        <span className="line-clamp-1">{d.title || d.draftContent.replace(/<[^>]*>/g, '').slice(0, 50) || 'Untitled Draft'}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isAnswer ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {isAnswer ? 'Answer' : 'Question'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-text-muted">
                        {new Date(d.lastSaved || d.updatedAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <Link href="/community/questions/create" className="inline-block p-1.5 text-primary hover:bg-primary/10 rounded" title="Resume Editing">
                          <i className="fas fa-external-link-alt"></i>
                        </Link>
                        <button onClick={() => handleDelete(d._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer" title="Discard Draft">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
