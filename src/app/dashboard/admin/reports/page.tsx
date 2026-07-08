'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '../../../../hooks/store';
import { showToast } from '../../../../features/ui/uiSlice';

export default function ReportsExportingPage() {
  const dispatch = useAppDispatch();
  const [reportType, setReportType] = useState('questions');
  const [downloading, setDownloading] = useState(false);

  const handleExport = () => {
    try {
      setDownloading(true);
      dispatch(showToast(`Exporting ${reportType} report...`));
      
      // Navigate to CSV download route
      window.location.href = `/api/reports?type=${reportType}`;
    } catch (err: any) {
      dispatch(showToast('Export failed'));
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">Reports Center</h1>
        <p className="text-xs text-text-muted mt-1">Export raw databases in standard CSV/Excel format for compliance and backups.</p>
      </div>

      <div className="bg-cardBg border border-border-custom rounded-xl p-6 shadow-card max-w-xl space-y-6">
        <h2 className="text-sm font-bold pb-2 border-b border-border-custom flex items-center gap-1.5">
          <i className="fas fa-file-excel text-success"></i> Export Configurations
        </h2>

        <div className="space-y-4">
          <label className="block text-xs font-bold uppercase text-text-secondary">Select Report Dataset</label>
          
          <div className="grid grid-cols-1 gap-3">
            <label className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
              reportType === 'questions' ? 'border-primary bg-primary/5' : 'border-border-custom hover:bg-border-light/30'
            }`}>
              <input
                type="radio"
                name="reportType"
                value="questions"
                checked={reportType === 'questions'}
                onChange={() => setReportType('questions')}
                className="w-4 h-4 text-primary"
              />
              <div className="text-xs text-left">
                <p className="font-bold text-text-primary">Questions & Answers catalog</p>
                <p className="text-text-muted mt-0.5">Export all contributed questions, category mappings, difficulty levels, and isPublished state.</p>
              </div>
            </label>

            <label className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
              reportType === 'users' ? 'border-primary bg-primary/5' : 'border-border-custom hover:bg-border-light/30'
            }`}>
              <input
                type="radio"
                name="reportType"
                value="users"
                checked={reportType === 'users'}
                onChange={() => setReportType('users')}
                className="w-4 h-4 text-primary"
              />
              <div className="text-xs text-left">
                <p className="font-bold text-text-primary">Users and roles ledger</p>
                <p className="text-text-muted mt-0.5">Export user display names, usernames, roles mappings, active status, and joined dates.</p>
              </div>
            </label>

            <label className={`p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
              reportType === 'reviews' ? 'border-primary bg-primary/5' : 'border-border-custom hover:bg-border-light/30'
            }`}>
              <input
                type="radio"
                name="reportType"
                value="reviews"
                checked={reportType === 'reviews'}
                onChange={() => setReportType('reviews')}
                className="w-4 h-4 text-primary"
              />
              <div className="text-xs text-left">
                <p className="font-bold text-text-primary">Moderation queue history logs</p>
                <p className="text-text-muted mt-0.5">Export logs of review actions, status changes, moderator comments, and version items.</p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-border-custom flex justify-end">
          <button
            onClick={handleExport}
            disabled={downloading}
            className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-55 border-0"
          >
            {downloading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Preparing file...</span>
              </>
            ) : (
              <>
                <i className="fas fa-download"></i>
                <span>Download CSV File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
