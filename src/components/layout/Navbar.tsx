'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useSidebar } from '../../hooks/useSidebar';
import { useQuestions } from '../../hooks/useQuestions';

export const Navbar: React.FC = () => {
  const { localQuery, updateSearchQuery } = useSearch();
  const { openSidebar } = useSidebar();
  const { filteredQuestions } = useQuestions();
  
  const [scrollProgress, setScrollProgress] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <header className="sticky top-0 z-[1020] bg-[rgba(255,255,255,0.85)] backdrop-blur-[12px] border-b border-border-custom shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 py-2 px-3">
      <div className="container-fluid flex items-center justify-between mx-auto">
        {/* Brand Title */}
        <a className="flex items-center no-underline text-text-primary" href="#">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white rounded p-2 flex items-center justify-center w-[38px] h-[38px]">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <span className="text-xl font-bold tracking-tight hidden md:flex">
              Interview Preparation Guide
            </span>
          </div>
        </a>

        {/* Middle Controls (Search, Total Count, Theme Indicator) */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative hidden md:block w-[280px]">
            <i className="fas fa-search text-text-muted absolute left-3 top-1/2 -translate-y-1/2 text-[0.85rem]"></i>
            <input
              ref={searchInputRef}
              type="text"
              value={localQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              className="form-control w-full pl-9 pr-16 py-1 text-sm bg-white border border-border-custom rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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

          {/* Theme Indicator (Light Only) */}
          <div className="hidden sm:flex items-center text-warning cursor-default" title="Light Theme Only">
            <i className="fas fa-sun text-lg"></i>
            <span className="ml-1.5 text-text-muted font-semibold hidden lg:inline text-[0.8rem]">
              Light
            </span>
          </div>

          {/* Mobile Sidebar Toggle */}
          <button
            onClick={openSidebar}
            className="btn border border-border-custom hover:bg-border-light text-text-secondary py-1 px-2.5 rounded-full md:hidden flex items-center justify-center text-sm"
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
