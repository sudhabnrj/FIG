'use client';

import React from 'react';
import { useSidebar } from '../../hooks/useSidebar';
import { useCategories } from '../../hooks/useCategories';
import { useQuestions } from '../../hooks/useQuestions';
import { CATEGORIES_LIST } from '../../config/settings';

export const MobileSidebar: React.FC = () => {
  const { isOpen, closeSidebar } = useSidebar();
  const { activeCategory, handleCategoryClick } = useCategories();
  const { categoryCounts, handleExpandAll, handleCollapseAll } = useQuestions();

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/40 z-[1040] transition-opacity duration-300 md:hidden animate-fade-in"
        ></div>
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 bottom-0 left-0 w-80 max-w-[80vw] bg-cardBg z-[1050] border-r border-border-custom shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border-custom">
          <h5 className="font-bold flex items-center gap-2 text-text-primary text-sm sm:text-base">
            <i className="fas fa-graduation-cap text-primary text-lg"></i> Interview Preparation Guide
          </h5>
          <button
            onClick={closeSidebar}
            type="button"
            className="text-text-muted hover:text-text-primary text-lg font-bold flex items-center justify-center w-8 h-8 rounded-full hover:bg-border-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h6 className="font-bold text-uppercase text-text-muted text-[0.8rem] tracking-wider uppercase mb-3">
            Categories
          </h6>
          <nav className="flex flex-col mb-6" aria-label="Mobile categories menu">
            {CATEGORIES_LIST.map((cat) => {
              const countKey = cat.matchKey || cat.name;
              const count = categoryCounts[countKey] || 0;
              const isCategoryActive = activeCategory.toLowerCase() === (cat.matchKey || cat.name).toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

              return (
                <button
                  key={cat.cleanKey}
                  type="button"
                  onClick={() => {
                    handleCategoryClick(countKey);
                    closeSidebar();
                  }}
                  aria-current={isCategoryActive ? 'true' : undefined}
                  className={`flex items-center justify-between px-[1.2rem] py-[0.8rem] mb-2 font-medium rounded-md transition-all duration-150 cursor-pointer border border-transparent select-none w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isCategoryActive
                      ? 'bg-primary text-white font-semibold'
                      : 'bg-transparent text-text-secondary hover:bg-primary-light hover:text-primary'
                  }`}
                  style={{ opacity: count === 0 ? 0.5 : 1 }}
                >
                  <span>
                    <i className={`${cat.icon} mr-2`}></i> {cat.name}
                  </span>
                  <span
                    className={`text-[0.75rem] px-2.5 py-0.5 rounded-full font-semibold ${
                      isCategoryActive
                        ? 'bg-white/20 text-white'
                        : 'bg-border-light text-text-primary border border-border-custom'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

          <h6 className="font-bold text-uppercase text-text-muted text-[0.8rem] tracking-wider uppercase mb-3">
            Actions
          </h6>
          <div className="grid gap-2">
            <button
              onClick={() => {
                handleExpandAll();
                closeSidebar();
              }}
              className="btn bg-primary text-white hover:bg-primary/95 text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors border-0 cursor-pointer"
            >
              <i className="fas fa-expand-arrows-alt"></i> Expand All Answers
            </button>
            <button
              onClick={() => {
                handleCollapseAll();
                closeSidebar();
              }}
              className="btn bg-white dark:bg-cardBg hover:bg-border-light dark:hover:bg-slate-800 text-text-secondary border border-border-custom text-xs font-semibold py-2 px-3 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className="fas fa-compress-arrows-alt"></i> Collapse All Answers
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
