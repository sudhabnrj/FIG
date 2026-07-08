'use client';

import React from 'react';

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
}

export default function AdminTable({ headers, children }: AdminTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
