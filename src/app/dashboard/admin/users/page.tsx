'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../hooks/store';
import { showToast } from '../../../../features/ui/uiSlice';

export default function UserManagementPage() {
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
    if (!confirm('Are you sure you want to delete this user? This sets status to deleted.')) return;
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">User Management</h1>
        <p className="text-xs text-text-muted mt-1">Review accounts, adjust roles, verify verification status, and manage restrictions.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-cardBg border border-border-custom rounded-xl p-4 shadow-card flex flex-col md:flex-row md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Search by name, username, email..."
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
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="p-2 bg-body border border-border-custom rounded-lg text-xs text-text-secondary font-semibold focus:outline-none"
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
            className="p-2 bg-body border border-border-custom rounded-lg text-xs text-text-secondary font-semibold focus:outline-none"
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
      <div className="bg-cardBg border border-border-custom rounded-xl overflow-hidden shadow-card">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <i className="fas fa-users text-4xl mb-3 text-primary/30"></i>
            <p className="text-sm font-semibold">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-text-primary">
              <thead className="bg-body border-b border-border-custom text-xs font-bold uppercase tracking-wider text-text-secondary">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-custom">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-border-light/20 transition-all">
                    <td className="p-4 font-semibold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-body border border-border-custom flex items-center justify-center text-xs font-bold text-primary">
                        {u.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          u.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-xs">{u.name}</p>
                        <p className="text-[10px] text-text-muted">@{u.username}</p>
                      </div>
                    </td>
                    <td className="p-4 text-xs">{u.email}</td>
                    <td className="p-4 capitalize text-xs">
                      <span className="bg-body border border-border-custom px-2 py-0.5 rounded font-semibold text-[10px]">{u.role}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        u.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : u.status === 'pending_verification'
                          ? 'bg-yellow-500/10 text-yellow-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {u.role !== 'super_admin' && (
                        <>
                          <button
                            onClick={() => { setSelectedUser(u); setNewRole(u.role); setShowRoleModal(true); }}
                            className="inline-block p-1.5 text-primary hover:bg-primary/10 rounded bg-transparent border-0 cursor-pointer text-xs font-bold"
                            title="Edit Role"
                          >
                            <i className="fas fa-user-tag"></i>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u._id, u.status)}
                            className={`p-1.5 rounded bg-transparent border-0 cursor-pointer text-xs font-bold ${
                              u.status === 'active' ? 'text-yellow-500 hover:bg-yellow-550/10' : 'text-green-500 hover:bg-green-550/10'
                            }`}
                            title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          >
                            <i className={u.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'}></i>
                          </button>
                          <button
                            onClick={() => { setSelectedUser(u); setShowPasswordModal(true); }}
                            className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded bg-transparent border-0 cursor-pointer text-xs font-bold"
                            title="Reset Password"
                          >
                            <i className="fas fa-key"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded bg-transparent border-0 cursor-pointer text-xs font-bold"
                            title="Delete User"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-cardBg border border-border-custom rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-text-primary">Change Account Role</h3>
            <p className="text-xs text-text-muted">Modify role settings for <strong>{selectedUser.name}</strong>.</p>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-sm focus:outline-none focus:border-primary text-text-primary"
            >
              <option value="user">User (Standard Contributor)</option>
              <option value="moderator">Moderator (Moderates Q&A Queue)</option>
              <option value="admin">Admin (Full Control)</option>
            </select>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setShowRoleModal(false)} className="px-3.5 py-2 border border-border-custom rounded-lg bg-transparent text-text-secondary hover:bg-border-light cursor-pointer">
                Cancel
              </button>
              <button onClick={handleRoleUpdate} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light border-0 cursor-pointer">
                Apply Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-cardBg border border-border-custom rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-text-primary">Reset Account Password</h3>
            <p className="text-xs text-text-muted">Enter a new secure password for <strong>{selectedUser.name}</strong>.</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 8 chars, uppercase, special, etc."
              className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-sm focus:outline-none focus:border-primary text-text-primary"
            />
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button onClick={() => setShowPasswordModal(false)} className="px-3.5 py-2 border border-border-custom rounded-lg bg-transparent text-text-secondary hover:bg-border-light cursor-pointer">
                Cancel
              </button>
              <button onClick={handlePasswordResetSubmit} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light border-0 cursor-pointer">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
