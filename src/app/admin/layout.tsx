'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { fetchMe, logoutUser } from '@/features/auth/authSlice';
import { useTheme } from '@/hooks/useTheme';
import { showToast } from '@/features/ui/uiSlice';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminNavbar from '@/components/admin/AdminNavbar';
import { ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();

  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize session
  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchMe());
    }
  }, [dispatch, isInitialized]);

  // Window resize checks for sidebar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login?redirect=' + pathname);
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070a13]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#ef4444] border-t-transparent"></div>
          <span className="text-sm font-semibold text-slate-400">Loading System Controller...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const hasAdminAccess = user.role === 'admin' || user.role === 'super_admin';

  if (!hasAdminAccess) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#070a13] text-center p-6 text-slate-200">
        <ShieldAlert className="h-16 w-16 text-[#ef4444] mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-white">403 - Forbidden</h1>
        <p className="text-slate-400 mt-2 max-w-md">You do not have administrative privileges to access this area.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-5 py-2.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg font-bold transition-all border-0 cursor-pointer shadow-lg shadow-[#ef4444]/20"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a13] font-sans text-slate-100">
      {/* Collapsible Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Container */}
      <div
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300"
        style={{ paddingLeft: !isMobile && sidebarOpen ? '16rem' : !isMobile ? '5rem' : '0' }}
      >
        {/* Navbar */}
        <AdminNavbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          user={user}
          onLogout={handleLogout}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#070a13]">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
