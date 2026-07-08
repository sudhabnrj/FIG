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
    <div className="p-6 bg-slate-900 border border-[#1e293b] rounded-xl shadow-lg flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700">
      <div className="space-y-1.5 text-left">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  );
}
