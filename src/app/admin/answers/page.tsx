'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/store';
import { showToast } from '@/features/ui/uiSlice';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { MessageSquare, Trash2, Search } from 'lucide-react';

export default function AdminAnswersPage() {
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
    <div className="space-y-6 text-left">
      <AdminHeader
        title="Contributed Answers Database"
        description="Search, filter, or discard contributed answers for interview questions."
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search answers content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#ef4444] text-xs"
          />
          <button type="submit" className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-all">
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        <div>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none"
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
      {loading ? (
        <div className="flex h-48 items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ef4444] border-t-transparent"></div>
        </div>
      ) : answers.length === 0 ? (
        <AdminEmptyState title="No answers found" icon={MessageSquare} />
      ) : (
        <AdminTable headers={['Question Title', 'Answer Extract', 'Status', 'Author', 'Date', 'Actions']}>
          {answers.map((a) => (
            <tr key={a._id} className="hover:bg-slate-50 transition-all border-b border-slate-100">
              <td className="p-4 font-bold max-w-[200px] truncate text-slate-800">{a.questionId?.title || 'Unknown Question'}</td>
              <td className="p-4 text-xs text-slate-500 max-w-[250px] truncate">
                {a.content.replace(/<[^>]*>/g, '')}
              </td>
              <td className="p-4 text-xs">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  a.status === 'active' || a.status === 'approved'
                    ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                    : a.status === 'pending_review'
                    ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'
                    : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>
                  {a.status.replace('_', ' ')}
                </span>
              </td>
              <td className="p-4 text-xs font-semibold text-slate-600">{a.authorId?.name || 'Contributor'}</td>
              <td className="p-4 text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
              <td className="p-4 text-right whitespace-nowrap">
                <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer text-xs" title="Delete Answer">
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {/* Pagination */}
      {pagesCount > 1 && (
        <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4 shadow-sm">
          <span className="text-xs text-slate-500">Showing page {page} of {pagesCount}</span>
          <div className="flex gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold cursor-pointer disabled:opacity-50 text-slate-700 bg-white"
            >
              Previous
            </button>
            <button
              disabled={page === pagesCount}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-xs font-bold cursor-pointer disabled:opacity-50 text-slate-700 bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
