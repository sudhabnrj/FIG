'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/store';
import { showToast } from '@/features/ui/uiSlice';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { FolderOpen, Edit3, Trash2, GitMerge, Plus, Search } from 'lucide-react';

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
        dispatch(showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!'));
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
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Category deleted successfully'));
        fetchCategories();
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error deleting category'));
    }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceId || !destinationId) {
      dispatch(showToast('Select both source and target categories'));
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
    <div className="space-y-6 text-left">
      <AdminHeader
        title="Subjects & Categories Management"
        description="Add dynamic interview categories, update sorting orders, or merge redundant categories."
      >
        <button onClick={() => setShowMergeModal(true)} className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5">
          <GitMerge className="h-4 w-4" />
          <span>Merge Categories</span>
        </button>
        <button onClick={handleOpenAdd} className="px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold rounded-lg border-0 cursor-pointer transition-all flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </AdminHeader>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ef4444] border-t-transparent"></div>
        </div>
      ) : categories.length === 0 ? (
        <AdminEmptyState title="No categories found" icon={FolderOpen} />
      ) : (
        <AdminTable headers={['Icon', 'Category Name', 'Slug', 'Description', 'Sort Order', 'Actions']}>
          {categories.map((cat) => (
            <tr key={cat._id} className="hover:bg-slate-50 transition-all border-b border-slate-100">
              <td className="p-4 text-center text-[#ef4444] text-base">
                <i className={`fas ${cat.icon || 'fa-folder'}`}></i>
              </td>
              <td className="p-4 font-bold text-slate-800">{cat.name}</td>
              <td className="p-4 text-xs font-mono text-slate-500">{cat.slug}</td>
              <td className="p-4 text-xs text-slate-500 max-w-[200px] truncate">{cat.description || '—'}</td>
              <td className="p-4 text-xs font-semibold text-slate-800">{cat.order}</td>
              <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                <button onClick={() => handleOpenEdit(cat)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded bg-transparent border-0 cursor-pointer text-xs" title="Edit Category">
                  <Edit3 className="h-4.5 w-4.5" />
                </button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer text-xs" title="Delete Category">
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {/* Add / Edit Category Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleAddEditSubmit} className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <h3 className="font-bold text-sm text-slate-800">{editingCategory ? 'Edit Category' : 'Create Category'}</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. JavaScript"
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary description..."
                rows={2}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-slate-800 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">FA Icon Code</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. fa-js"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sort order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button type="button" onClick={() => setShowAddEditModal(false)} className="px-3.5 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-500 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] border-0 cursor-pointer">
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleMergeSubmit} className="bg-white border border-slate-200 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <GitMerge className="h-4.5 w-4.5 text-[#ef4444]" />
              <span>Merge Categories</span>
            </h3>
            <p className="text-xs text-slate-500">Warning: This shifts all questions associated with the Source Category to the Target Category, and then deletes the source entry.</p>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Source Category (deletes)</label>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-slate-800"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Target Category (absorbs questions)</label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-slate-800"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button type="button" onClick={() => setShowMergeModal(false)} className="px-3.5 py-2 border border-slate-200 rounded-lg bg-transparent text-slate-500 hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={merging} className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] border-0 cursor-pointer disabled:opacity-50">
                {merging ? 'Merging...' : 'Execute Merge'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
