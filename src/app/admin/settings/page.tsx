'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/hooks/store';
import { showToast } from '@/features/ui/uiSlice';
import AdminHeader from '@/components/admin/AdminHeader';
import { Shield, Key, RefreshCw, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('24');
  const [rateLimit, setRateLimit] = useState('100');
  const [updating, setUpdating] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      // Mock save delay to simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 800));
      dispatch(showToast('Security and global configurations saved successfully'));
    } catch (err: any) {
      dispatch(showToast('Failed to update settings'));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-xl mx-auto">
      <AdminHeader
        title="Site Controls & Security Policy"
        description="Configure access control boundaries, registration limits, and global configuration values."
      />

      <form onSubmit={handleSave} className="bg-slate-900 border border-[#1e293b] rounded-xl p-6 shadow-lg space-y-6 text-slate-300">
        <h3 className="text-sm font-bold text-white pb-2 border-b border-[#1e293b] flex items-center gap-2">
          <Shield className="h-4.5 w-4.5 text-[#ef4444]" />
          <span>Access Control Options</span>
        </h3>

        {/* Maintenance Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-xs text-white">Maintenance mode</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Restrict access to admin users only and show a maintenance splash page.</p>
          </div>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
            className="w-8 h-4 bg-slate-950 border border-[#1e293b] checked:bg-[#ef4444] rounded-full cursor-pointer focus:outline-none"
          />
        </div>

        {/* Registration Toggle */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-xs text-white">Allow Public Registrations</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Enable public signup pages and allow verify flows.</p>
          </div>
          <input
            type="checkbox"
            checked={allowSignups}
            onChange={(e) => setAllowSignups(e.target.checked)}
            className="w-8 h-4 bg-slate-950 border border-[#1e293b] checked:bg-[#ef4444] rounded-full cursor-pointer focus:outline-none"
          />
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Session Timeout (hours)</label>
            <input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-[#1e293b] rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-white"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Rate Limit (req/min)</label>
            <input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-[#1e293b] rounded-lg text-xs focus:outline-none focus:border-[#ef4444] text-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#1e293b]">
          <button
            type="submit"
            disabled={updating}
            className="px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border-0 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{updating ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
