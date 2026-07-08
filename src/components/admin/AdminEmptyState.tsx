'use client';

import React from 'react';

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  children?: React.ReactNode;
}

export default function AdminEmptyState({ title, description, icon: Icon, children }: AdminEmptyStateProps) {
  return (
    <div className="p-12 text-center text-slate-400 bg-slate-900 border border-[#1e293b] rounded-xl shadow-lg flex flex-col items-center justify-center space-y-3.5">
      <div className="w-12 h-12 bg-slate-800 text-[#ef4444] rounded-full flex items-center justify-center text-2xl">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {description && <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{description}</p>}
      </div>
      {children && <div className="pt-2">{children}</div>}
    </div>
  );
}
