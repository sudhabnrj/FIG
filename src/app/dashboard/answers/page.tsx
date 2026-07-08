'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../hooks/store';
import { showToast } from '../../../features/ui/uiSlice';

export default function MyAnswersPage() {
  const dispatch = useAppDispatch();
  const [answers, setAnswers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchAnswers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) query.append('search', search);
      if (status) query.append('status', status);

      const res = await fetch(`/api/answers?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAnswers(json.data);
        setTotal(json.pagination.total);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAnswers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this answer contribution?')) return;
    try {
      const res = await fetch('/api/answers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Answer deleted successfully'));
        fetchAnswers();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Deletion failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const pagesCount = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">My Answers</h1>
        <p className="text-xs text-text-muted mt-1">Manage and track your contributed answers for interview questions.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-cardBg border border-border-custom rounded-xl p-4 shadow-card flex flex-col md:flex-row md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search answers content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control flex-1 p-2 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-semibold transition-all">
            Search
          </button>
        </form>

        <div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="p-2 bg-body border border-border-custom rounded-lg text-xs text-text-secondary font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_review">Pending Review</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="draft">Draft</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-cardBg border border-border-custom rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : answers.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <i className="fas fa-comment-alt text-4xl mb-3 text-primary/30"></i>
            <p className="text-sm font-semibold">No answers found</p>
            <p className="text-xs mt-1">Try updating your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead className="bg-body border-b border-border-custom text-xs font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="p-4">Question Reference</th>
                  <th className="p-4">Answer Extract</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {answers.map((a) => (
                  <tr key={a._id} className="hover:bg-border-light/20 transition-all">
                    <td className="p-4 font-semibold">
                      <span className="line-clamp-1">{a.questionId?.title || 'Unknown Question'}</span>
                    </td>
                    <td className="p-4">
                      {/* strip html tags */}
                      <span className="line-clamp-1 text-text-secondary text-xs">
                        {a.content.replace(/<[^>]*>/g, '')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        a.status === 'active' || a.status === 'approved'
                          ? 'bg-green-500/15 text-green-600'
                          : a.status === 'pending_review'
                          ? 'bg-yellow-500/15 text-yellow-600'
                          : a.status === 'needs_revision'
                          ? 'bg-orange-500/15 text-orange-600'
                          : 'bg-red-500/15 text-red-600'
                      }`}>
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-muted">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer" title="Delete Answer">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        {pagesCount > 1 && (
          <div className="p-4 bg-body border-t border-border-custom flex items-center justify-between gap-4">
            <span className="text-xs text-text-muted">Showing page {page} of {pagesCount}</span>
            <div className="flex gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 border border-border-custom rounded hover:bg-border-light text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page === pagesCount}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 border border-border-custom rounded hover:bg-border-light text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
