'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { fetchMe } from '../../features/auth/authSlice';
import { useTheme } from '../../hooks/useTheme';
import { showToast } from '../../features/ui/uiSlice';

interface SidebarItem {
  name: string;
  href: string;
  icon: string;
  roles?: ('user' | 'moderator' | 'admin' | 'super_admin')[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: 'fa-chart-pie' },
  { name: 'My Profile', href: '/dashboard/profile', icon: 'fa-user-circle' },
  { name: 'My Questions', href: '/dashboard/questions', icon: 'fa-question-circle' },
  { name: 'My Answers', href: '/dashboard/answers', icon: 'fa-comment-alt' },
  { name: 'Drafts', href: '/dashboard/drafts', icon: 'fa-edit' },
  { name: 'Bookmarks', href: '/dashboard/bookmarks', icon: 'fa-bookmark' },
  { name: 'Notifications', href: '/dashboard/notifications', icon: 'fa-bell' },
  { name: 'Account Settings', href: '/dashboard/settings', icon: 'fa-cog' },
  { name: 'Review Queue', href: '/dashboard/reviews', icon: 'fa-clipboard-check', roles: ['moderator', 'admin', 'super_admin'] },
  { name: 'User Management', href: '/dashboard/admin/users', icon: 'fa-users-cog', roles: ['admin', 'super_admin'] },
  { name: 'Roles & RBAC', href: '/dashboard/admin/roles', icon: 'fa-shield-alt', roles: ['admin', 'super_admin'] },
  { name: 'Categories', href: '/dashboard/admin/categories', icon: 'fa-folder-open', roles: ['admin', 'super_admin'] },
  { name: 'Tags', href: '/dashboard/admin/tags', icon: 'fa-tags', roles: ['admin', 'super_admin'] },
  { name: 'Media Library', href: '/dashboard/admin/media', icon: 'fa-images', roles: ['admin', 'super_admin'] },
  { name: 'SEO Settings', href: '/dashboard/admin/seo', icon: 'fa-search-plus', roles: ['admin', 'super_admin'] },
  { name: 'Site System', href: '/dashboard/admin/system', icon: 'fa-sliders-h', roles: ['admin', 'super_admin'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { theme, toggleAppTheme } = useTheme();

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

  // Access checks
  const isRouteAdmin = pathname.startsWith('/dashboard/admin');
  const isRouteMod = pathname.startsWith('/dashboard/reviews');

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login?redirect=' + pathname);
    }
  }, [isInitialized, isAuthenticated, pathname, router]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-body">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-sm font-semibold text-text-secondary">Initializing Dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // RBAC path guard check
  const hasAdminAccess = user.role === 'admin' || user.role === 'super_admin';
  const hasModAccess = hasAdminAccess || user.role === 'moderator';

  if (isRouteAdmin && !hasAdminAccess) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-body text-center p-6">
        <i className="fas fa-lock text-6xl text-red-500 mb-4"></i>
        <h1 className="text-2xl font-bold text-text-primary">403 - Forbidden</h1>
        <p className="text-text-muted mt-2 max-w-md">You do not have administrative privileges to access this area.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (isRouteMod && !hasModAccess) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-body text-center p-6">
        <i className="fas fa-lock text-6xl text-red-500 mb-4"></i>
        <h1 className="text-2xl font-bold text-text-primary">403 - Forbidden</h1>
        <p className="text-text-muted mt-2 max-w-md">You do not have moderator credentials to access this area.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-body font-sans text-text-primary">
      {/* Collapsible Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-cardBg border-r border-border-custom transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        } ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border-custom bg-navbar/20">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-text-primary no-underline">
            <div className="bg-primary text-white p-2 rounded flex items-center justify-center h-8 w-8">
              <i className="fas fa-graduation-cap"></i>
            </div>
            {sidebarOpen && <span className="tracking-tight text-base font-extrabold">Interview CMS</span>}
          </Link>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-text-secondary hover:text-text-primary bg-transparent border-0 cursor-pointer text-lg"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4" aria-label="Dashboard Sidebar">
          {SIDEBAR_ITEMS.map((item) => {
            // Check roles
            if (item.roles && !item.roles.includes(user.role as any)) return null;

            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all no-underline ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-border-light hover:text-text-primary'
                }`}
                title={item.name}
              >
                <i className={`fas ${item.icon} w-5 text-center text-base`}></i>
                {sidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border-custom text-xs text-text-muted">
            <p className="mb-1 truncate font-bold">@{user.username}</p>
            <p className="capitalize text-[10px] font-semibold tracking-wider text-primary bg-primary/10 rounded px-1.5 py-0.5 inline-block">
              {user.role}
            </p>
          </div>
        )}
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300 lg:pl-0" style={{ paddingLeft: !isMobile && sidebarOpen ? '16rem' : !isMobile ? '5rem' : '0' }}>
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-border-custom bg-navbar backdrop-blur-md z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-secondary hover:text-text-primary bg-transparent border-0 cursor-pointer p-1 rounded-lg hover:bg-border-light text-lg"
              title="Toggle sidebar"
            >
              <i className="fas fa-bars"></i>
            </button>
            <span className="text-sm text-text-muted hidden md:flex items-center gap-1.5">
              <Link href="/dashboard" className="text-text-muted hover:text-primary no-underline">Dashboard</Link>
              <i className="fas fa-chevron-right text-[10px]"></i>
              <span className="font-semibold text-text-primary capitalize">{pathname.split('/').pop() || 'Overview'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme selector */}
            <button
              onClick={toggleAppTheme}
              className="text-warning hover:text-warning/80 bg-transparent border-0 cursor-pointer p-2 rounded-full hover:bg-border-light text-base"
              title="Toggle dark mode"
            >
              <i className={`fas ${theme === 'light' ? 'fa-sun' : 'fa-moon text-indigo-400'}`}></i>
            </button>

            {/* Back to Public Web */}
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-border-custom rounded-lg text-text-secondary hover:text-primary transition-all no-underline"
            >
              <i className="fas fa-external-link-alt"></i>
              <span>Public Website</span>
            </Link>

            {/* User Dropdown Profile */}
            <div className="flex items-center gap-2 border-l border-border-custom pl-4">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border-custom bg-body flex items-center justify-center font-bold text-primary text-sm">
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-text-primary truncate max-w-[100px]">{user.name}</span>
                <span className="text-[10px] text-text-muted capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-body p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
