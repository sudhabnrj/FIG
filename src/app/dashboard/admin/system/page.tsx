'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../hooks/store';
import { showToast } from '../../../../features/ui/uiSlice';

export default function SystemSettingsPage() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [savingSite, setSavingSite] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  // Site Settings
  const [siteName, setSiteName] = useState('');
  const [logo, setLogo] = useState('');
  const [footer, setFooter] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [passwordMinLength, setPasswordMinLength] = useState(8);
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [requireUppercase, setRequireUppercase] = useState(true);

  // Audit Logs
  const [logs, setLogs] = useState<any[]>([]);

  const loadSettingsAndLogs = async () => {
    try {
      setLoading(true);
      const [siteRes, secRes, logsRes] = await Promise.all([
        fetch('/api/settings/site'),
        fetch('/api/settings/security'),
        fetch('/api/dashboard/logs?limit=5'),
      ]);

      const siteJson = await siteRes.json();
      const secJson = await secRes.json();
      const logsJson = await logsRes.json();

      if (siteJson.success && siteJson.data) {
        setSiteName(siteJson.data.siteName || '');
        setLogo(siteJson.data.logo || '');
        setFooter(siteJson.data.footer || '');
        setMaintenanceMode(siteJson.data.maintenanceMode || false);
      }

      if (secJson.success && secJson.data) {
        setSessionTimeout(secJson.data.sessionTimeout || 30);
        setPasswordMinLength(secJson.data.passwordMinLength || 8);
        setRequireSpecialChar(secJson.data.requireSpecialChar ?? true);
        setRequireUppercase(secJson.data.requireUppercase ?? true);
      }

      if (logsJson.success && logsJson.data) {
        setLogs(logsJson.data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsAndLogs();
  }, []);

  const handleSiteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSite(true);
      const res = await fetch('/api/settings/site', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          logo,
          footer,
          maintenanceMode,
        }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Site settings saved successfully!'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error saving site settings'));
    } finally {
      setSavingSite(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSecurity(true);
      const res = await fetch('/api/settings/security', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionTimeout: Number(sessionTimeout),
          passwordMinLength: Number(passwordMinLength),
          requireSpecialChar,
          requireUppercase,
        }),
      });
      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Security policy settings saved successfully!'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error saving security settings'));
    } finally {
      setSavingSecurity(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">System Configuration</h1>
        <p className="text-xs text-text-muted mt-1">Configure layout values, security session policies, maintenance locks, and audit activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Layout Form */}
        <form onSubmit={handleSiteSubmit} className="bg-cardBg border border-border-custom rounded-xl p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold pb-2 border-b border-border-custom flex items-center gap-1.5">
            <i className="fas fa-desktop text-primary"></i> Site Settings
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Site Title Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Footer Copyright Text</label>
            <input
              type="text"
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
              className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-body border border-border-custom rounded-lg text-xs">
            <div>
              <p className="font-bold text-text-primary">Maintenance Mode Lock</p>
              <p className="text-[10px] text-text-muted">Restrict non-admin routes access immediately</p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 text-primary bg-cardBg rounded border-border-custom focus:ring-primary"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border-custom">
            <button
              type="submit"
              disabled={savingSite}
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer border-0"
            >
              {savingSite ? 'Saving...' : 'Save Site Settings'}
            </button>
          </div>
        </form>

        {/* Security policies form */}
        <form onSubmit={handleSecuritySubmit} className="bg-cardBg border border-border-custom rounded-xl p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold pb-2 border-b border-border-custom flex items-center gap-1.5">
            <i className="fas fa-shield-alt text-primary"></i> Security Policies
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Session Expiry (mins)</label>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Number(e.target.value))}
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Password Min Length</label>
              <input
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(Number(e.target.value))}
                className="w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-xs text-text-primary"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-body border border-border-custom rounded-lg text-xs">
            <div>
              <p className="font-bold text-text-primary">Require Uppercase</p>
              <p className="text-[10px] text-text-muted">Password requires capitalized letters</p>
            </div>
            <input
              type="checkbox"
              checked={requireUppercase}
              onChange={(e) => setRequireUppercase(e.target.checked)}
              className="w-4 h-4 text-primary bg-cardBg rounded border-border-custom focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-body border border-border-custom rounded-lg text-xs">
            <div>
              <p className="font-bold text-text-primary">Require Special Characters</p>
              <p className="text-[10px] text-text-muted">Password requires symbols characters</p>
            </div>
            <input
              type="checkbox"
              checked={requireSpecialChar}
              onChange={(e) => setRequireSpecialChar(e.target.checked)}
              className="w-4 h-4 text-primary bg-cardBg rounded border-border-custom focus:ring-primary"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-border-custom">
            <button
              type="submit"
              disabled={savingSecurity}
              className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer border-0"
            >
              {savingSecurity ? 'Saving...' : 'Save Security Policies'}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Logs */}
      <div className="bg-cardBg border border-border-custom rounded-xl p-5 shadow-card space-y-4">
        <h2 className="text-sm font-bold pb-2 border-b border-border-custom flex items-center gap-1.5">
          <i className="fas fa-list-ul text-primary"></i> System Security Audit Trails
        </h2>

        {logs.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">No audit actions recorded</p>
        ) : (
          <div className="space-y-3.5">
            {logs.map((log) => (
              <div key={log._id} className="p-3 bg-body border border-border-custom rounded-lg flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-border-custom flex items-center justify-center text-xs">
                    <i className="fas fa-history text-text-secondary"></i>
                  </div>
                  <div>
                    <p className="font-bold text-text-primary capitalize">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-text-muted">By: {log.userId?.name || 'System'} | IP: {log.ip || 'Unknown'}</p>
                  </div>
                </div>
                <span className="text-[10px] text-text-muted">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
