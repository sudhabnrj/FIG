'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HelpCircle,
  MessageSquare,
  FolderOpen,
  Users,
  FileBarChart,
  Settings,
  X,
  Shield,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Questions', href: '/admin/questions', icon: HelpCircle },
  { name: 'Answers', href: '/admin/answers', icon: MessageSquare },
  { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Reports', href: '/admin/reports', icon: FileBarChart },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function AdminSidebar({ isOpen, onClose, isMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 text-slate-600 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-0 lg:w-20'
      } ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}`}
    >
      {/* Brand */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 bg-slate-50">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-800 no-underline">
          <div className="bg-[#ef4444] text-white p-2 rounded-lg flex items-center justify-center h-9 w-9 shadow-lg shadow-[#ef4444]/20">
            <Shield className="h-5 w-5" />
          </div>
          {isOpen && <span className="tracking-tight text-base font-extrabold">Interview Admin</span>}
        </Link>
        {isMobile && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer text-lg p-1.5 hover:bg-slate-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav Link List */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6" aria-label="Admin Sidebar">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 no-underline ${
                isActive
                  ? 'bg-[#ef4444] text-white shadow-md shadow-[#ef4444]/15'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={item.name}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      {isOpen && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-[#ef4444] bg-[#ef4444]/10 rounded-lg px-2.5 py-1.5 justify-center">
            <span className="h-2 w-2 rounded-full bg-[#ef4444] animate-ping"></span>
            <span>SYSTEM CONTROL ACTIVE</span>
          </div>
        </div>
      )}
    </aside>
  );
}
