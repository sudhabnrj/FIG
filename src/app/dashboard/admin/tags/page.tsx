'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../hooks/store';
import { showToast } from '../../../../features/ui/uiSlice';

export default function AdminTagsPage() {
  const dispatch = useAppDispatch();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [name, setName] = useState('');

  // Merge tags modal
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [merging, setMerging] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tags');
      const json = await res.json();
      if (json.success) {
        setTags(json.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleOpenAdd = () => {
    setEditingTag(null);
    setName('');
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingTag(t);
    setName(t.name);
    setShowAddEditModal(true);
  };

  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const url = editingTag ? `/api/tags/${editingTag._id}` : '/api/tags';
      const method = editingTag ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      const json = await res.json();
      if (json.success) {
        dispatch(showToast(editingTag ? 'Tag updated' : 'Tag created'));
        setShowAddEditModal(false);
        fetchTags();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Operation failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag? (Questions will keep the tag string but the central tag dictionary entry is deleted)')) return;

    try {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Tag deleted'));
        fetchTags();
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error deleting tag'));
    }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !destinationId) {
      dispatch(showToast('Select both source and target tags'));
      return;
    }
    if (sourceId === destinationId) {
      dispatch(showToast('Source and destination cannot be the same'));
      return;
    }

    try {
      setMerging(true);
      const res = await fetch('/api/tags/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, destinationId }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Tags merged successfully!'));
        setShowMergeModal(false);
        setSourceId('');
        setDestinationId('');
        fetchTags();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Merge failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error merging tags'));
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Tags Management</h1>
          <p className="text-xs text-text-muted mt-1">Add, update, search, delete, and merge tag taxonomies used throughout contributed questions.</p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={() => setShowMergeModal(true)} className="px-3.5 py-2 border border-border-custom bg-cardBg hover:bg-border-light text-text-secondary text-xs font-bold rounded-lg cursor-pointer transition-all">
            <i className="fas fa-code-branch"></i> Merge Tags
          </button>
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg shadow-md border-0 cursor-pointer transition-all">
            <i className="fas fa-plus"></i> Add Tag
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-cardBg border border-border-custom rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : tags.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <i className="fas fa-tags text-4xl mb-3 text-primary/30"></i>
            <p className="text-sm font-semibold">No tags registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead className="bg-body border-b border-border-custom text-xs font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="p-4">Tag Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Created At</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {tags.map((t) => (
                  <tr key={t._id} className="hover:bg-border-light/20 transition-all">
                    <td className="p-4 font-bold">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">#{t.name}</span>
                    </td>
                    <td className="p-4 text-xs font-mono text-text-muted">{t.slug}</td>
                    <td className="p-4 text-xs text-text-muted">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <button onClick={() => handleOpenEdit(t)} className="inline-block p-1.5 text-blue-500 hover:bg-blue-500/10 rounded bg-transparent border-0 cursor-pointer text-xs" title="Edit Tag">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(t._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer text-xs" title="Delete Tag">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleAddEditSubmit} className="bg-cardBg border border-border-custom rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-text-primary">{editingTag ? 'Edit Tag' : 'Create Tag'}</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Tag Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. react-hooks"
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                required
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button type="button" onClick={() => setShowAddEditModal(false)} className="px-3.5 py-2 border border-border-custom rounded-lg bg-transparent text-text-secondary hover:bg-border-light cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light border-0 cursor-pointer">
                Save Tag
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleMergeSubmit} className="bg-cardBg border border-border-custom rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5">
              <i className="fas fa-code-branch text-primary"></i> Merge Tags
            </h3>
            <p className="text-xs text-text-muted">DANGER: This action moves all associations from the Source Tag into the Target Tag, and then DELETES the Source Tag entry.</p>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Source Tag (will be deleted)</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                required
              >
                <option value="">Select Tag</option>
                {tags.map((t) => (
                  <option key={t._id} value={t._id}>#{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Target Tag (will absorb questions)</label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                required
              >
                <option value="">Select Tag</option>
                {tags.map((t) => (
                  <option key={t._id} value={t._id}>#{t.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button type="button" onClick={() => setShowMergeModal(false)} className="px-3.5 py-2 border border-border-custom rounded-lg bg-transparent text-text-secondary hover:bg-border-light cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={merging} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light border-0 cursor-pointer disabled:opacity-55">
                {merging ? 'Merging...' : 'Execute Merge'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
