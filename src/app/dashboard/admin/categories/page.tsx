'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../hooks/store';
import { showToast } from '../../../../features/ui/uiSlice';

export default function AdminCategoriesPage() {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [order, setOrder] = useState(0);

  // Merge categories modal
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [merging, setMerging] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('');
    setOrder(0);
    setShowAddEditModal(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIcon(cat.icon || '');
    setOrder(cat.order || 0);
    setShowAddEditModal(true);
  };

  const handleAddEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon: icon.trim(),
          order: Number(order),
        }),
      });

      const json = await res.json();
      if (json.success) {
        dispatch(showToast(editingCategory ? 'Category updated' : 'Category created'));
        setShowAddEditModal(false);
        fetchCategories();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Operation failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? (Note: questions will remain but have empty/dangling reference)')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Category deleted'));
        fetchCategories();
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error deleting category'));
    }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !destinationId) {
      dispatch(showToast('Select both source and destination categories'));
      return;
    }
    if (sourceId === destinationId) {
      dispatch(showToast('Source and destination cannot be the same'));
      return;
    }

    try {
      setMerging(true);
      const res = await fetch('/api/categories/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, destinationId }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Categories merged successfully!'));
        setShowMergeModal(false);
        setSourceId('');
        setDestinationId('');
        fetchCategories();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Merge failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error merging categories'));
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Categories Management</h1>
          <p className="text-xs text-text-muted mt-1">Configure subjects, priority ordering values, font-awesome icons, and trigger bulk merges.</p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={() => setShowMergeModal(true)} className="px-3.5 py-2 border border-border-custom bg-cardBg hover:bg-border-light text-text-secondary text-xs font-bold rounded-lg cursor-pointer transition-all">
            <i className="fas fa-code-branch"></i> Merge Categories
          </button>
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg shadow-md border-0 cursor-pointer transition-all">
            <i className="fas fa-plus"></i> Add Category
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-cardBg border border-border-custom rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <i className="fas fa-folder-open text-4xl mb-3 text-primary/30"></i>
            <p className="text-sm font-semibold">No categories registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead className="bg-body border-b border-border-custom text-xs font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="p-4 w-12 text-center">Icon</th>
                  <th className="p-4">Category Name</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Sort Order</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-border-light/20 transition-all">
                    <td className="p-4 text-center text-base text-primary">
                      <i className={`fas ${cat.icon || 'fa-folder'}`}></i>
                    </td>
                    <td className="p-4 font-bold">{cat.name}</td>
                    <td className="p-4 text-xs font-mono text-text-muted">{cat.slug}</td>
                    <td className="p-4 text-xs text-text-secondary">
                      <span className="line-clamp-1">{cat.description || '—'}</span>
                    </td>
                    <td className="p-4 text-xs font-semibold">{cat.order}</td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      <button onClick={() => handleOpenEdit(cat)} className="inline-block p-1.5 text-blue-500 hover:bg-blue-500/10 rounded bg-transparent border-0 cursor-pointer text-xs" title="Edit Category">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer text-xs" title="Delete Category">
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
            <h3 className="font-bold text-sm text-text-primary">{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. JavaScript"
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary..."
                rows={2}
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">FontAwesome Icon</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. fa-code"
                  className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Sort order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button type="button" onClick={() => setShowAddEditModal(false)} className="px-3.5 py-2 border border-border-custom rounded-lg bg-transparent text-text-secondary hover:bg-border-light cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light border-0 cursor-pointer">
                Save Category
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
              <i className="fas fa-code-branch text-primary"></i> Merge Categories
            </h3>
            <p className="text-xs text-text-muted">DANGER: This action shifts all questions of the Source Category into the Target Category, and then DELETES the Source Category permanently.</p>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Source Category (will be deleted)</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Target Category (will absorb questions)</label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button type="button" onClick={() => setShowMergeModal(false)} className="px-3.5 py-2 border border-border-custom rounded-lg bg-transparent text-text-secondary hover:bg-border-light cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={merging} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light border-0 cursor-pointer disabled:opacity-50">
                {merging ? 'Merging...' : 'Execute Merge'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
