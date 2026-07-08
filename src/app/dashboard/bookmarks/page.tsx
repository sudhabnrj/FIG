'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '../../../hooks/store';
import { showToast } from '../../../features/ui/uiSlice';

export default function BookmarksPage() {
  const dispatch = useAppDispatch();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/bookmarks');
      const json = await res.json();
      if (json.success) {
        setBookmarks(json.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Bookmark removed successfully'));
        fetchBookmarks();
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error removing bookmark'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Bookmarks</h1>
        <p className="text-xs text-text-muted mt-1">Access all of your saved interview questions and answers in one place.</p>
      </div>

      <div className="bg-cardBg border border-border-custom rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <i className="fas fa-bookmark text-4xl mb-3 text-primary/30"></i>
            <p className="text-sm font-semibold">No bookmarks saved</p>
            <p className="text-xs mt-1">Start bookmarking questions while practicing to catalog them here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead className="bg-body border-b border-border-custom text-xs font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="p-4">Content Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Saved Category</th>
                  <th className="p-4">Bookmarked Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {bookmarks.map((b) => {
                  const bookmark = b.bookmark;
                  const details = b.details;
                  const isQuestion = bookmark.entityType === 'question';
                  const title = isQuestion 
                    ? (details.title || details.question.slice(0, 60)) 
                    : `Answer for: ${details.questionId?.title || 'Question'}`;

                  return (
                    <tr key={bookmark._id} className="hover:bg-border-light/20 transition-all">
                      <td className="p-4 font-semibold">
                        <span className="line-clamp-1">{title}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isQuestion ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {bookmark.entityType}
                        </span>
                      </td>
                      <td className="p-4">{bookmark.category}</td>
                      <td className="p-4 text-xs text-text-muted">
                        {new Date(bookmark.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button onClick={() => handleRemove(bookmark._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer" title="Remove Bookmark">
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
