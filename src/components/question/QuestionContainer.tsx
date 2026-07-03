'use client';

import React, { useEffect, useRef } from 'react';
import { Question } from '../../types';
import { useAppDispatch } from '../../hooks/store';
import { setQuestions } from '../../features/questions/questionsSlice';
import { useQuestions } from '../../hooks/useQuestions';
import { useSearch } from '../../hooks/useSearch';
import { useCategories } from '../../hooks/useCategories';
import { QuestionCard } from './QuestionCard';

interface QuestionContainerProps {
  initialQuestions: Question[];
}

export default function QuestionContainer({ initialQuestions }: QuestionContainerProps) {
  const dispatch = useAppDispatch();
  const isInitialized = useRef(false);

  // Initialize store questions with SSR data on mount
  if (!isInitialized.current) {
    dispatch(setQuestions(initialQuestions));
    isInitialized.current = true;
  }

  const { query, updateSearchQuery } = useSearch();
  const { filteredQuestions, groupedQuestions, isLoading, error } = useQuestions();
  const { selectCategory } = useCategories();

  // Sidebar Scroll-Spy Tracker
  useEffect(() => {
    const handleScroll = () => {
      const categories = ["AI", "UI / UX", "React", "JavaScript", "Next.js"];
      let currentCat = '';

      // Bottom proximity check
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80;

      if (isAtBottom) {
        for (let i = categories.length - 1; i >= 0; i--) {
          const cat = categories[i];
          const cleanId = cat.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + 'Section';
          const element = document.getElementById(cleanId);
          if (element && element.offsetHeight > 0) {
            currentCat = cat.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            break;
          }
        }
      } else {
        for (const cat of categories) {
          const cleanId = cat.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + 'Section';
          const element = document.getElementById(cleanId);
          if (element && element.offsetHeight > 0) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 180 && rect.bottom >= 180) {
              currentCat = cat.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
              break;
            }
          }
        }
      }

      if (currentCat) {
        selectCategory(currentCat);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(handleScroll, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [initialQuestions, query, selectCategory]);

  return (
    <section className="col-md-8 col-xl-8 flex-1 main-column">
      {/* Mobile Search input */}
      <div className="container md:hidden py-3 px-0 mx-auto">
        <div className="relative w-full">
          <i className="fas fa-search text-text-muted absolute left-4 top-1/2 -translate-y-1/2"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => updateSearchQuery(e.target.value)}
            className="form-control w-full pl-10 pr-4 py-2.5 bg-white border border-border-custom rounded-lg shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            placeholder="Search Q&A..."
          />
        </div>
      </div>

      <div id="questionsContainer" className="relative min-h-[400px]">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-6 text-center my-10">
            <i className="fas fa-exclamation-triangle text-3xl mb-3"></i>
            <h4 className="text-lg font-bold">Failed to Load Questions</h4>
            <p className="text-sm text-text-muted mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white hover:bg-primary/95 text-xs font-semibold py-2 px-4 rounded mt-4 cursor-pointer border-0"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && filteredQuestions.length === 0 && (
          <div className="bg-[#e0f2fe] text-[#0369a1] text-center py-8 px-4 my-10 rounded border border-[#bae6fd]">
            <i className="fas fa-search text-3xl mb-3 text-[#64748b]"></i>
            <h4 className="text-xl font-bold">No Questions Found</h4>
            <p className="text-text-muted mt-1 mb-0">
              We couldn't find any questions matching "{query}". Try different terms.
            </p>
          </div>
        )}

        {!isLoading &&
          !error &&
          Object.entries(groupedQuestions).map(([cat, catQuestions]) => {
            if (catQuestions.length === 0) return null;
            const cleanCatId = cat.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

            return (
              <section
                key={cat}
                id={`${cleanCatId}Section`}
                className="category-section"
              >
                <h2 className="category-section-title text-2xl font-bold mb-3">
                  <span>{cat} Interview Questions</span>
                </h2>
                <div className="cards-list">
                  {catQuestions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                    />
                  ))}
                </div>
              </section>
            );
          })}
      </div>
    </section>
  );
}
