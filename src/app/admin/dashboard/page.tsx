'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch } from '@/hooks/store';
import { showToast } from '@/features/ui/uiSlice';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import AdminTable from '@/components/admin/AdminTable';
import AdminEmptyState from '@/components/admin/AdminEmptyState';
import {
  HelpCircle,
  MessageSquare,
  FolderOpen,
  Users,
  AlertTriangle,
  History,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, logsRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/dashboard/logs?limit=5'),
        ]);

        const dashJson = await dashRes.json();
        const logsJson = await logsRes.json();

        if (dashJson.success) setData(dashJson.data);
        if (logsJson.success) setLogs(logsJson.data);
      } catch (err: any) {
        dispatch(showToast('Failed to load dashboard statistics'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ef4444] border-t-transparent"></div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-8 text-left">
      <AdminHeader
        title="Admin Control Center"
        description="Comprehensive oversight of application health, user credentials, dynamic taxonomies, and moderation tasks."
      >
        <Link
          href="/admin/reports"
          className="px-3.5 py-2 bg-slate-900 border border-[#1e293b] rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:border-slate-500 no-underline flex items-center gap-1.5"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Reports</span>
        </Link>
      </AdminHeader>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatsCard
          label="Total Questions"
          value={stats.totalQuestions || 0}
          icon={HelpCircle}
          color="bg-blue-500/10 text-blue-400 border border-blue-500/20"
        />
        <AdminStatsCard
          label="Total Answers"
          value={stats.totalAnswers || 0}
          icon={MessageSquare}
          color="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <AdminStatsCard
          label="Total Users"
          value={stats.totalUsers || 0}
          icon={Users}
          color="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        />
        <AdminStatsCard
          label="Pending Reviews"
          value={stats.pendingReviews || 0}
          icon={AlertTriangle}
          color="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 animate-pulse"
        />
      </div>

      {/* Two Column details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: System Taxonomy */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold pb-2 border-b border-slate-200 flex items-center gap-2 text-slate-800">
            <FolderOpen className="h-4.5 w-4.5 text-[#ef4444]" />
            <span>Taxonomy Allocation</span>
          </h2>
          <div className="space-y-4 text-xs text-slate-600">
            <div className="flex justify-between items-center">
              <span>Categories</span>
              <span className="font-extrabold text-slate-800">{stats.totalCategories || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Tags</span>
              <span className="font-extrabold text-slate-800">{stats.totalTags || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Library Attachments</span>
              <span className="font-extrabold text-slate-800">{stats.mediaFilesCount || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Storage Size</span>
              <span className="font-extrabold text-slate-800">{(stats.storageUsage / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          </div>
        </div>

        {/* Right: Security Audit log preview */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between h-[300px] lg:h-auto">
          <h2 className="text-sm font-bold pb-2 border-b border-slate-200 flex items-center justify-between text-slate-800">
            <span className="flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-[#ef4444]" />
              <span>Recent Security Events</span>
            </span>
            <Link href="/admin/settings" className="text-xs text-[#ef4444] font-bold hover:underline no-underline">
              View Settings
            </Link>
          </h2>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pt-2">
            {logs.length === 0 ? (
              <AdminEmptyState title="No logs found" icon={History} />
            ) : (
              logs.map((log) => (
                <div key={log._id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-800 capitalize">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">By: {log.userId?.name || 'System'} | IP: {log.ip || 'Local'}</p>
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Moderation queue quick actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center space-y-4 max-w-xl mx-auto">
        <CheckCircle className="h-10 w-10 text-[#ef4444] mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Interactive Review Queue</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">Access the review moderation console to approve or request revisions for contributed content.</p>
        <Link href="/dashboard/reviews" className="inline-block px-5 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg text-xs font-bold transition-all no-underline border-0 cursor-pointer shadow-lg shadow-[#ef4444]/25">
          Moderate Queue
        </Link>
      </div>
    </div>
  );
}
