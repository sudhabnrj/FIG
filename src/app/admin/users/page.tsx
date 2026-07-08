'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '@/hooks/store';
import { showToast } from '@/features/ui/uiSlice';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTable from '@/components/admin/AdminTable';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import { Users, UserX, UserCheck, Key, ShieldAlert, Trash2, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [newRole, setNewRole] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) query.append('search', search);
      if (roleFilter) query.append('role', roleFilter);
      if (statusFilter) query.append('status', statusFilter);

      const res = await fetch(`/api/users?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setTotal(json.pagination.total);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast(`User status updated to ${nextStatus}`));
        fetchUsers();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Update failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error updating status'));
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('User role updated successfully'));
        setShowRoleModal(false);
        fetchUsers();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Role update failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const handlePasswordResetSubmit = async () => {
    if (!selectedUser || newPassword.length < 8) {
      dispatch(showToast('Password must be at least 8 characters long'));
      return;
    }
    try {
      const res = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('User password changed successfully'));
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        dispatch(showToast(json.errors?.[0] || 'Password reset failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('User deleted successfully'));
        fetchUsers();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Delete failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const pagesCount = Math.ceil(total / limit);

  return (
    <div className="space-y-6 text-left">
      <AdminHeader
        title="Users Database Ledger"
        description="Search accounts records, adjust authorization groups, or apply limits flags."
      />

      {/* Filters */}
      <div className="bg-slate-900 border border-[#1e293b] rounded-xl p-4 shadow-lg flex flex-col md:flex-row md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 bg-slate-950 border border-[#1e293b] rounded-lg text-slate-300 focus:outline-none focus:border-[#ef4444] text-xs"
          />
          <button type="submit" className="px-4 py-2 bg-slate-950 border border-[#1e293b] hover:border-slate-500 text-slate-300 rounded-lg text-xs font-bold transition-all">
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="p-2 bg-slate-950 border border-[#1e293b] rounded-lg text-xs text-slate-300 font-semibold focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="p-2 bg-slate-950 border border-[#1e293b] rounded-lg text-xs text-slate-300 font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="suspended">Suspended</option>
            <option value="blocked">Blocked</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="flex h-48 items-center justify-center bg-slate-900 border border-[#1e293b] rounded-xl shadow-lg">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ef4444] border-t-transparent"></div>
        </div>
      ) : users.length === 0 ? (
        <AdminEmptyState title="No users registered" icon={Users} />
      ) : (
        <AdminTable headers={['User', 'Email', 'Role', 'Status', 'Joined Date', 'Actions']}>
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-slate-800/20 transition-all border-b border-[#1e293b]">
              <td className="p-4 font-semibold flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-950 border border-[#1e293b] flex items-center justify-center text-xs font-bold text-[#ef4444]">
                  {u.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    u.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-bold text-xs text-white">{u.name}</p>
                  <p className="text-[10px] text-slate-400">@{u.username}</p>
                </div>
              </td>
              <td className="p-4 text-xs text-slate-300">{u.email}</td>
              <td className="p-4 capitalize text-xs">
                <span className="bg-slate-950 border border-[#1e293b] px-2 py-0.5 rounded font-semibold text-[10px] text-slate-300">{u.role}</span>
              </td>
              <td className="p-4">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  u.status === 'active'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : u.status === 'pending_verification'
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {u.status}
                </span>
              </td>
              <td className="p-4 text-xs text-slate-400">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                {u.role !== 'admin' && u.role !== 'super_admin' && (
                  <>
                    <button
                      onClick={() => { setSelectedUser(u); setNewRole(u.role); setShowRoleModal(true); }}
                      className="inline-block p-1.5 text-primary hover:bg-primary/10 rounded bg-transparent border-0 cursor-pointer text-xs"
                      title="Change Role"
                    >
                      <ShieldAlert className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u._id, u.status)}
                      className={`p-1.5 rounded bg-transparent border-0 cursor-pointer text-xs ${
                        u.status === 'active' ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-green-400 hover:bg-green-500/10'
                      }`}
                      title={u.status === 'active' ? 'Suspend' : 'Activate'}
                    >
                      {u.status === 'active' ? <UserX className="h-4.5 w-4.5" /> : <UserCheck className="h-4.5 w-4.5" />}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => { setSelectedUser(u); setShowPasswordModal(true); }}
                  className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded bg-transparent border-0 cursor-pointer text-xs"
                  title="Reset Password"
                >
                  <Key className="h-4.5 w-4.5" />
                </button>

                {u.role !== 'admin' && u.role !== 'super_admin' && (
                  <button
                    onClick={() => handleDelete(u._id)}
                    className="p-1.5 text-red-400 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer text-xs"
                    title="Delete User"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      {/* Pagination */}
      {pagesCount > 1 && (
        <div className="p-4 bg-slate-900 border border-[#1e293b] rounded-xl flex items-center justify-between gap-4">
          <span className="text-xs text-slate-400">Showing page {page} of {pagesCount}</span>
          <div className="flex gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 border border-[#1e293b] rounded hover:bg-slate-800 text-xs font-bold cursor-pointer disabled:opacity-50 text-slate-300"
            >
              Previous
            </button>
            <button
              disabled={page === pagesCount}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 border border-[#1e293b] rounded hover:bg-slate-800 text-xs font-bold cursor-pointer disabled:opacity-50 text-slate-300"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-[#1e293b] rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150 text-left">
            <h3 className="font-bold text-sm text-white">Change Account Role</h3>
            <p className="text-xs text-slate-400">Modify authorization level for <strong>{selectedUser.name}</strong>.</p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-[#1e293b] rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-white"
            >
              <option value="user">User (Standard Contributor)</option>
              <option value="moderator">Moderator (Review Submissions)</option>
              <option value="admin">Admin (Full Control)</option>
            </select>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setShowRoleModal(false)} className="px-3.5 py-2 border border-[#1e293b] rounded-lg bg-transparent text-slate-400 hover:bg-slate-800 cursor-pointer">
                Cancel
              </button>
              <button onClick={handleRoleUpdate} className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] border-0 cursor-pointer">
                Apply Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-900 border border-[#1e293b] rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150 text-left">
            <h3 className="font-bold text-sm text-white">Override User Password</h3>
            <p className="text-xs text-slate-400">Apply a new secure password credential for <strong>{selectedUser.name}</strong>.</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters..."
              className="w-full p-2.5 bg-slate-950 border border-[#1e293b] rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-white"
            />
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setShowPasswordModal(false)} className="px-3.5 py-2 border border-[#1e293b] rounded-lg bg-transparent text-slate-400 hover:bg-slate-800 cursor-pointer">
                Cancel
              </button>
              <button onClick={handlePasswordResetSubmit} className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] border-0 cursor-pointer">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
