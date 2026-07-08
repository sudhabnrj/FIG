'use client';

import React, { useEffect, useState } from 'react';

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Retrieve stats from dashboard API
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  
  // Custom mock analytics data since it represents trends
  const visitorTrends = [
    { day: 'Mon', count: 420 },
    { day: 'Tue', count: 510 },
    { day: 'Wed', count: 480 },
    { day: 'Thu', count: 620 },
    { day: 'Fri', count: 700 },
    { day: 'Sat', count: 550 },
    { day: 'Sun', count: 590 },
  ];
  const maxTrendVal = Math.max(...visitorTrends.map((t) => t.count));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">System Analytics</h1>
        <p className="text-xs text-text-muted mt-1">Review visual logs, traffic metrics, taxonomy metrics, and leaderboard contributions.</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Visitor Traffic Chart */}
        <div className="md:col-span-2 bg-cardBg border border-border-custom rounded-xl p-5 shadow-card flex flex-col justify-between h-[350px]">
          <div className="flex items-center justify-between pb-4 border-b border-border-custom">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-secondary">Weekly Traffic Activity (Page Views)</h3>
            <span className="text-[10px] bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded">+15% over last week</span>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 pt-6 pb-2 px-4 h-full">
            {visitorTrends.map((t, idx) => {
              const pct = (t.count / maxTrendVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-primary/10 rounded-t-md hover:bg-primary transition-all duration-300 relative group cursor-pointer" style={{ height: `${pct * 0.7}%` }}>
                    {/* Tooltip */}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-all font-semibold">
                      {t.count}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted font-bold">{t.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Database Allocations */}
        <div className="md:col-span-1 bg-cardBg border border-border-custom rounded-xl p-5 shadow-card flex flex-col justify-between h-[350px]">
          <h3 className="font-bold text-xs uppercase tracking-wider text-text-secondary pb-4 border-b border-border-custom">Taxonomy Allocations</h3>
          
          <div className="flex-1 flex flex-col justify-center gap-4 py-4 text-xs text-text-secondary">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Categories distribution</span>
                <span>{stats.totalCategories || 0}</span>
              </div>
              <div className="w-full bg-body rounded-full h-2 border border-border-custom overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Tags coverage</span>
                <span>{stats.totalTags || 0}</span>
              </div>
              <div className="w-full bg-body rounded-full h-2 border border-border-custom overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Media library files</span>
                <span>{stats.mediaFilesCount || 0}</span>
              </div>
              <div className="w-full bg-body rounded-full h-2 border border-border-custom overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
