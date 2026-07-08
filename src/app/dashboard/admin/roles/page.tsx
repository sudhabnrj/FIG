'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../hooks/store';
import { showToast } from '../../../../features/ui/uiSlice';

export default function RolesManagementPage() {
  const dispatch = useAppDispatch();
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  
  // Custom role creation
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Selected role edit values
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        fetch('/api/roles'),
        fetch('/api/permissions'),
      ]);
      const rolesJson = await rolesRes.json();
      const permsJson = await permsRes.json();
      
      if (rolesJson.success && permsJson.success) {
        setRoles(rolesJson.data);
        setPermissions(permsJson.data);
        if (rolesJson.data.length > 0 && !selectedRoleId) {
          selectRole(rolesJson.data[0]);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role: any) => {
    setSelectedRoleId(role._id);
    setRoleName(role.name);
    setRoleDesc(role.description || '');
    setSelectedPerms(role.permissions || []);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePermissionToggle = (permName: string) => {
    if (selectedPerms.includes(permName)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== permName));
    } else {
      setSelectedPerms([...selectedPerms, permName]);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/roles/${selectedRoleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roleName,
          description: roleDesc,
          permissions: selectedPerms,
        }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Role permissions updated successfully'));
        // refresh
        const refreshedRes = await fetch('/api/roles');
        const refreshedJson = await refreshedRes.json();
        if (refreshedJson.success) {
          setRoles(refreshedJson.data);
        }
      } else {
        dispatch(showToast(json.errors?.[0] || 'Update failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoleName.trim().toLowerCase().replace(/\s+/g, '_'),
          description: newRoleDesc,
          permissions: [],
        }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Custom role created successfully!'));
        setShowCreateModal(false);
        setNewRoleName('');
        setNewRoleDesc('');
        loadData();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Creation failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Role deleted successfully'));
        setSelectedRoleId(null);
        loadData();
      } else {
        dispatch(showToast(json.errors?.[0] || 'Delete failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error occurred'));
    }
  };

  const selectedRole = roles.find((r) => r._id === selectedRoleId);

  // Group permissions by module
  const modules: { [key: string]: any[] } = {};
  permissions.forEach((p) => {
    if (!modules[p.module]) modules[p.module] = [];
    modules[p.module].push(p);
  });

  if (loading && roles.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Role-Based Access Control (RBAC)</h1>
          <p className="text-xs text-text-muted mt-1">Configure security permissions mapped to guest, user, moderator, and administrator roles.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer border-0 self-start">
          <i className="fas fa-plus"></i> Create Custom Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Card: Role List */}
        <div className="lg:col-span-1 bg-cardBg border border-border-custom rounded-xl p-5 shadow-card flex flex-col h-[550px]">
          <h2 className="text-sm font-bold pb-2 border-b border-border-custom mb-4">Roles</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {roles.map((r) => {
              const active = selectedRoleId === r._id;
              const isCore = ['super_admin', 'admin', 'moderator', 'user', 'guest'].includes(r.name);
              return (
                <div
                  key={r._id}
                  onClick={() => selectRole(r)}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-4 cursor-pointer bg-transparent ${
                    active ? 'border-primary bg-primary/5' : 'border-border-custom hover:bg-border-light/40'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-xs text-text-primary capitalize">{r.name.replace('_', ' ')}</h3>
                    <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">{r.description || 'No description'}</p>
                  </div>
                  {!isCore && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteRole(r._id); }} className="text-red-500 hover:bg-red-500/10 p-1 rounded bg-transparent border-0 cursor-pointer text-xs" title="Delete Custom Role">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Card: Editor Form */}
        <div className="lg:col-span-2 bg-cardBg border border-border-custom rounded-xl p-5 shadow-card h-[550px] flex flex-col overflow-hidden">
          {selectedRole ? (
            <form onSubmit={handleUpdateRole} className="flex-1 flex flex-col h-full overflow-hidden">
              <h2 className="text-sm font-bold pb-2 border-b border-border-custom mb-4 flex items-center justify-between">
                <span>Role Permissions mapping: <strong className="capitalize text-primary">{roleName.replace('_', ' ')}</strong></span>
                {selectedRole.name === 'super_admin' && (
                  <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase tracking-wider px-2 py-0.5 rounded">All Permissions Enabled</span>
                )}
              </h2>

              <div className="flex-1 overflow-y-auto pr-1 space-y-5 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Role Name</label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      disabled={['super_admin', 'admin', 'moderator', 'user', 'guest'].includes(selectedRole.name)}
                      className="form-control w-full p-2 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs capitalize disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Role Description</label>
                    <input
                      type="text"
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                      placeholder="Define the role purpose..."
                      className="form-control w-full p-2 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                {/* Modules Permissions Grid */}
                {selectedRole.name !== 'super_admin' ? (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-text-primary">Assigned Permissions Matrix</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(modules).map(([moduleName, perms]) => (
                        <div key={moduleName} className="p-3.5 bg-body border border-border-custom rounded-lg space-y-2 text-xs">
                          <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-primary border-b border-border-custom pb-1.5 mb-2">{moduleName}</h4>
                          <div className="space-y-2">
                            {perms.map((p) => {
                              const checked = selectedPerms.includes(p.name);
                              return (
                                <label key={p.name} className="flex items-start gap-2.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handlePermissionToggle(p.name)}
                                    className="w-4 h-4 text-primary bg-cardBg rounded border-border-custom focus:ring-primary mt-0.5"
                                  />
                                  <div>
                                    <p className="font-semibold text-xs text-text-primary">{p.name.split(':')[1].replace('_', ' ')}</p>
                                    <p className="text-[10px] text-text-muted mt-0.5">{p.description}</p>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center text-text-muted flex flex-col items-center justify-center">
                    <i className="fas fa-shield-alt text-5xl text-primary/30 mb-3"></i>
                    <p className="font-semibold text-sm">Super Admin Policy Bypass</p>
                    <p className="text-xs mt-1 max-w-sm">The Super Admin holds master configurations and is assigned all privileges dynamically by default.</p>
                  </div>
                )}
              </div>

              {selectedRole.name !== 'super_admin' && (
                <div className="pt-4 border-t border-border-custom bg-cardBg flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-primary hover:bg-primary-light text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer disabled:opacity-55"
                  >
                    {saving ? 'Saving changes...' : 'Update Permissions Matrix'}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-text-muted">
              <i className="fas fa-user-shield text-5xl text-primary/20 mb-3"></i>
              <h3 className="text-sm font-bold text-text-primary">Select a Role</h3>
              <p className="text-xs max-w-xs mt-1">Select a role from the left list to review or configure permissions mapping.</p>
            </div>
          )}
        </div>
      </div>

      {/* Role Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateRole} className="bg-cardBg border border-border-custom rounded-xl p-6 w-full max-w-sm space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-sm text-text-primary">Create Custom Role</h3>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Role Identifier (no spaces)</label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. content_reviewer"
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">Description</label>
              <input
                type="text"
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                placeholder="Brief purpose description..."
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg text-xs focus:outline-none focus:border-primary text-text-primary"
              />
            </div>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="px-3.5 py-2 border border-border-custom rounded-lg bg-transparent text-text-secondary hover:bg-border-light cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light border-0 cursor-pointer">
                Create Role
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
