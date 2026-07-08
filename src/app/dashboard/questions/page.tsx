'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '../../../hooks/store';
import { showToast } from '../../../features/ui/uiSlice';

export default function MyQuestionsPage() {
  const dispatch = useAppDispatch();
  const [questions, setQuestions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) query.append('search', search);
      if (status) query.append('status', status);
      if (difficulty) query.append('difficulty', difficulty);

      const res = await fetch(`/api/questions?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
        setTotal(json.pagination.total);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, difficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question contribution?')) return;
    try {
      const res = await fetch('/api/questions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Question deleted successfully'));
        fetchQuestions();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">My Questions</h1>
          <p className="text-xs text-text-muted mt-1">Manage and track your contributed frontend interview questions.</p>
        </div>
        <Link href="/community/questions/create" className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 no-underline self-start">
          <i className="fas fa-plus"></i> Contribute Question
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-cardBg border border-border-custom rounded-xl p-4 shadow-card flex flex-col md:flex-row md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control flex-1 p-2 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-sm"
          />
          <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-light text-white rounded-lg text-sm font-semibold transition-all">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
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

          <select
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            className="p-2 bg-body border border-border-custom rounded-lg text-xs text-text-secondary font-semibold focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-cardBg border border-border-custom rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <i className="fas fa-question-circle text-4xl mb-3 text-primary/30"></i>
            <p className="text-sm font-semibold">No questions found</p>
            <p className="text-xs mt-1">Try updating your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead className="bg-body border-b border-border-custom text-xs font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {questions.map((q) => (
                  <tr key={q._id} className="hover:bg-border-light/20 transition-all">
                    <td className="p-4 font-semibold">
                      <span className="line-clamp-1">{q.title || q.question.slice(0, 50)}</span>
                    </td>
                    <td className="p-4 capitalize">{q.category}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        q.difficulty === 'easy'
                          ? 'bg-green-500/10 text-green-500'
                          : q.difficulty === 'medium'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        q.status === 'active' || q.status === 'approved'
                          ? 'bg-green-500/15 text-green-600'
                          : q.status === 'pending_review'
                          ? 'bg-yellow-500/15 text-yellow-600'
                          : q.status === 'needs_revision'
                          ? 'bg-orange-500/15 text-orange-600'
                          : 'bg-red-500/15 text-red-600'
                      }`}>
                        {q.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-muted">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link href={`/dashboard/questions/edit/${q._id}`} className="inline-block p-1.5 text-blue-500 hover:bg-blue-500/10 rounded" title="Edit Question">
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button onClick={() => handleDelete(q._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer" title="Delete Question">
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
