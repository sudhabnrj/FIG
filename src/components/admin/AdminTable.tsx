'use client';

import React from 'react';

interface AdminTableProps {
  headers: string[];
  children: React.ReactNode;
}

export default function AdminTable({ headers, children }: AdminTableProps) {
  return (
    <div className="bg-slate-900 border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-300">
          <thead className="bg-slate-950 border-b border-[#1e293b] text-xs font-bold uppercase tracking-wider text-slate-400">
            <tr>
              {headers.map((h, idx) => (
                <th key={idx} className="p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
