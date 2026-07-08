'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, LogOut, ShieldAlert } from 'lucide-react';

interface AdminNavbarProps {
  onToggleSidebar: () => void;
  user: any;
  onLogout: () => void;
}

export default function AdminNavbar({ onToggleSidebar, user, onLogout }: AdminNavbarProps) {
  return (
    <header className="flex h-16 items-center justify-between px-6 border-b border-slate-200 bg-white text-slate-800 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="text-slate-500 hover:text-slate-800 bg-transparent border-0 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 text-lg flex items-center justify-center"
          title="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Highly Visible Admin Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ef4444]/10 border border-[#ef4444]/25 text-[#ef4444] rounded-full text-xs font-bold tracking-wide uppercase select-none">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Admin Control Panel</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Return to Public Web */}
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:border-slate-400 transition-all no-underline"
        >
          <span>Public Site</span>
        </Link>

        {/* Admin profile detail info */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-[#ef4444]/30 bg-slate-100 flex items-center justify-center font-bold text-[#ef4444] text-sm">
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'A'
            )}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 truncate max-w-[100px]">{user?.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">{user?.role || 'administrator'}</span>
          </div>

          {/* Quick logout */}
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-red-500 bg-transparent border-0 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-center"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
