'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useSidebar } from '../../hooks/useSidebar';
import { useQuestions } from '../../hooks/useQuestions';
import { useTheme } from '../../hooks/useTheme';
import { APP_CONFIG } from '../../config/app';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { fetchMe, logoutUser } from '../../features/auth/authSlice';
import { showToast } from '../../features/ui/uiSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const { localQuery, updateSearchQuery } = useSearch();
  const { openSidebar } = useSidebar();
  const { filteredQuestions } = useQuestions();
  const { theme, toggleAppTheme } = useTheme();
  
  const { user, isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize session once
  useEffect(() => {
    if (!isInitialized) {
      dispatch(fetchMe());
    }
  }, [dispatch, isInitialized]);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    const resultAction = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(resultAction)) {
      dispatch(showToast('Logged out successfully'));
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-[1020] bg-navbar backdrop-blur-[12px] border-b border-border-custom shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 py-2 px-3">
      <div className="container-fluid flex items-center justify-between mx-auto">
        {/* Brand Title */}
        <Link className="flex items-center no-underline text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1" href="/">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white rounded p-2 flex items-center justify-center w-[38px] h-[38px]">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:flex">
              {APP_CONFIG.title}
            </span>
          </div>
        </Link>

        {/* Middle Controls (Search, Total Count, Theme Indicator) */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative hidden md:block w-[220px] lg:w-[280px]">
            <i className="fas fa-search text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-[0.85rem]"></i>
            <input
              ref={searchInputRef}
              type="text"
              value={localQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              className="form-control w-full pl-9 pr-16 py-1.5 text-sm bg-white border border-border-custom rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Search Q&A... (Ctrl + F)"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 bg-border-light text-text-muted text-[0.7rem] px-1.5 py-0.5 rounded border border-border-custom font-bold pointer-events-none">
              Ctrl+F
            </kbd>
          </div>

          {/* Total Questions count */}
          <div className="flex items-center bg-white border border-border-custom rounded-full px-3 py-1 text-text-muted font-semibold text-[0.85rem] shadow-sm">
            <span className="mr-1">Total:</span>
            <span className="badge bg-primary text-white rounded-full px-2 py-0.5 text-[0.75rem] font-bold">
              {filteredQuestions.length}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleAppTheme}
            className="flex items-center text-warning hover:text-warning/80 transition-colors cursor-pointer bg-transparent border-0 p-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary select-none"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <>
                <i className="fas fa-sun text-lg"></i>
                <span className="ml-1.5 text-text-muted font-semibold hidden lg:inline text-[0.8rem]">
                  Light
                </span>
              </>
            ) : (
              <>
                <i className="fas fa-moon text-lg text-indigo-400"></i>
                <span className="ml-1.5 text-text-muted font-semibold hidden lg:inline text-[0.8rem]">
                  Dark
                </span>
              </>
            )}
          </button>

          {/* Dynamic Authentication controls */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border border-border-custom bg-body flex items-center justify-center font-bold text-primary text-sm hover:border-primary active:scale-95 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none"
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                aria-label="User profile options"
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-cardBg border border-border-custom rounded-xl shadow-lg py-1.5 z-[1050] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-border-custom">
                    <p className="text-sm font-bold text-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">@{user.username}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm text-text-secondary hover:bg-border-light hover:text-text-primary transition-colors focus:outline-none focus:bg-border-light"
                  >
                    <i className="fas fa-user-circle text-text-muted w-4 text-center"></i>
                    <span>Profile Settings</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-sm text-text-secondary hover:bg-border-light hover:text-text-primary transition-colors focus:outline-none focus:bg-border-light"
                  >
                    <i className="fas fa-cog text-text-muted w-4 text-center"></i>
                    <span>Preferences</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-0 focus:outline-none focus:bg-red-500/10"
                  >
                    <i className="fas fa-sign-out-alt w-4 text-center"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors px-2.5 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-primary hover:bg-primary-light text-white transition-colors px-3 py-1.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={openSidebar}
            className="btn border border-border-custom hover:bg-border-light text-text-secondary py-1.5 px-2.5 rounded-full md:hidden flex items-center justify-center text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            type="button"
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>

      {/* Top Scroll reading progress bar container */}
      <div className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent rounded-r-[2px] transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>
    </header>
  );
};
