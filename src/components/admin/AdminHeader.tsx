'use client';

import React from 'react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function AdminHeader({ title, description, children }: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 mb-6">
      <div className="text-left">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">{title}</h1>
        {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2.5 self-start sm:self-center">{children}</div>}
    </div>
  );
}
