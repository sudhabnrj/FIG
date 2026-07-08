'use client';

import React from 'react';

interface AdminStatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
}

export default function AdminStatsCard({ label, value, icon: Icon, color }: AdminStatsCardProps) {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300">
      <div className="space-y-1.5 text-left">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}
