'use client';

import React, { useEffect, useMemo } from 'react';
import { Question } from '../../types';
import { QuestionCard } from './QuestionCard';
import { useCategories } from '../../hooks/useCategories';

interface VirtualizedQuestionListProps {
  groupedQuestions: Record<string, Question[]>;
}

type VirtualItem =
  | { type: 'header'; label: string; key: string }
  | { type: 'card'; question: Question; key: string };

export const VirtualizedQuestionList: React.FC<VirtualizedQuestionListProps> = ({
  groupedQuestions,
}) => {
  const { clickedCategory, resetClickedCategory, selectCategory } = useCategories();

  // Flatten categories and questions into a single item list
  const virtualItems = useMemo(() => {
    const items: VirtualItem[] = [];
    Object.entries(groupedQuestions).forEach(([cat, catQuestions]) => {
      if (catQuestions.length === 0) return;
      const cleanCatId = cat.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      // Add section header
      items.push({ type: 'header', label: cat, key: `${cleanCatId}Section` });
      // Add cards
      catQuestions.forEach((q) => {
        items.push({ type: 'card', question: q, key: `card-${q.id}` });
      });
    });
    return items;
  }, [groupedQuestions]);

  // Handle scroll trigger when a sidebar category is clicked
  useEffect(() => {
    if (clickedCategory) {
      const element = document.getElementById(`${clickedCategory}Section`);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - 85; // 85px offset for sticky header

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
      resetClickedCategory();
    }
  }, [clickedCategory, resetClickedCategory]);

  // Scroll-Spy: update active category in sidebar as the user scrolls
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const sections = document.querySelectorAll('.category-section');
      let activeSectionId = '';

      // Find the last section whose top is above the trigger threshold (e.g., 100px from top)
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          activeSectionId = section.id.replace('Section', '');
        }
      });

      if (activeSectionId) {
        selectCategory(activeSectionId);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on load to highlight the initially visible section
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [selectCategory, virtualItems]);

  return (
    <div className="cards-list pb-20">
      {virtualItems.map((item) => {
        if (item.type === 'header') {
          const cleanCatId = item.label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          return (
            <div
              key={item.key}
              id={`${cleanCatId}Section`}
              className="category-section select-none pt-2"
            >
              <h2 className="category-section-title text-2xl font-bold mb-3 mt-6">
                <span>{item.label} Interview Questions</span>
              </h2>
            </div>
          );
        }
        return (
          <div key={item.key} className="pb-4">
            <QuestionCard question={item.question} />
          </div>
        );
      })}
    </div>
  );
};
