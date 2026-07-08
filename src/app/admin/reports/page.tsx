'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/hooks/store';
import { showToast } from '@/features/ui/uiSlice';
import AdminHeader from '@/components/admin/AdminHeader';
import { HelpCircle, MessageSquare, Users, History, Download } from 'lucide-react';

export default function AdminReportsPage() {
  const dispatch = useAppDispatch();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    try {
      setDownloading(type);
      const res = await fetch(`/api/dashboard/export?type=${type}`);
      if (!res.ok) throw new Error('Export download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-guide-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      dispatch(showToast(`${type.toUpperCase()} report exported successfully`));
    } catch (err: any) {
      dispatch(showToast(err.message || 'Failed to download report'));
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    { name: 'questions', label: 'Questions catalog database', desc: 'Full lists of topics, status flags, and slugs configurations.', icon: HelpCircle },
    { name: 'answers', label: 'Answers database ledger', desc: 'Complete lists of community answers, status codes, and authorship.', icon: MessageSquare },
    { name: 'users', label: 'Users accounts directory', desc: 'Registered user profiles details, metadata logs, and access credentials.', icon: Users },
    { name: 'logs', label: 'System audit logs ledger', desc: 'Actions registry, IP addresses records, and event updates logs.', icon: History },
  ];

  return (
    <div className="space-y-6 text-left">
      <AdminHeader
        title="Admin Export & Reports Center"
        description="Download CSV data exports from system databases for audit reporting."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          const isCurrent = downloading === r.name;

          return (
            <div key={r.name} className="p-6 bg-slate-900 border border-[#1e293b] rounded-xl flex items-start gap-4 shadow-lg hover:border-slate-700 transition-all duration-300">
              <div className="p-3.5 bg-slate-950 text-[#ef4444] rounded-xl">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1.5">
                <h3 className="font-bold text-sm text-white capitalize">{r.name} Data Ledger</h3>
                <p className="text-xs text-slate-400">{r.desc}</p>
                <button
                  onClick={() => handleExport(r.name)}
                  disabled={!!downloading}
                  className="mt-3 px-3.5 py-2 bg-slate-950 border border-[#1e293b] hover:border-slate-500 text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{isCurrent ? 'Exporting...' : 'Download CSV'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
