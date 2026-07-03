'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { List, useListRef } from 'react-window';
import { Question } from '../../types';
import { QuestionCard } from './QuestionCard';
import { useQuestions } from '../../hooks/useQuestions';
import { useCategories } from '../../hooks/useCategories';

interface VirtualizedQuestionListProps {
  groupedQuestions: Record<string, Question[]>;
}

type VirtualItem =
  | { type: 'header'; label: string; key: string }
  | { type: 'card'; question: Question; key: string };

interface RowProps {
  virtualItems: VirtualItem[];
}

const Row = ({
  index,
  style,
  virtualItems,
}: {
  index: number;
  style: React.CSSProperties;
  virtualItems: VirtualItem[];
}) => {
  const item = virtualItems[index];
  if (!item) return null;

  if (item.type === 'header') {
    const cleanCatId = item.label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return (
      <div style={style} id={`${cleanCatId}Section`} className="category-section select-none pt-2">
        <h2 className="category-section-title text-2xl font-bold mb-3">
          <span>{item.label} Interview Questions</span>
        </h2>
      </div>
    );
  }

  return (
    <div style={{ ...style, paddingRight: '8px' }} className="pb-4">
      <QuestionCard question={item.question} />
    </div>
  );
};

export const VirtualizedQuestionList: React.FC<VirtualizedQuestionListProps> = ({
  groupedQuestions,
}) => {
  const listRef = useListRef();
  const { isCardExpanded, expandedCards } = useQuestions();
  const { clickedCategory, resetClickedCategory, selectCategory } = useCategories();
  const [listHeight, setListHeight] = useState(600);

  // Flatten categories and questions into a single virtual feed list
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

  // Adjust container height to match the visible viewport minus headers
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateHeight = () => {
      setListHeight(window.innerHeight - 150);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle scroll trigger when a sidebar category is clicked
  useEffect(() => {
    if (clickedCategory && listRef.current) {
      const index = virtualItems.findIndex(
        (item) => item.type === 'header' && item.key === `${clickedCategory}Section`
      );
      if (index > -1) {
        listRef.current.scrollToRow({ index, align: 'start' });
      }
      resetClickedCategory();
    }
  }, [clickedCategory, virtualItems, resetClickedCategory, listRef]);

  const getItemHeight = (index: number) => {
    const item = virtualItems[index];
    if (!item) return 50;

    if (item.type === 'header') {
      return 56; // Header section title height
    }

    const q = item.question;
    const isExpanded = isCardExpanded(q.id);
    const titleLines = Math.ceil(q.question.length / 55);
    let height = 150 + titleLines * 26; // Base card collapsed height with paddings

    if (isExpanded) {
      height += 50; // padding and divider overhead
      
      const cleanAnswer = q.answer.replace(/<[^>]*>/g, '');
      const answerLines = Math.ceil(cleanAnswer.length / 65);
      height += answerLines * 22; // text lines

      // Pre element/code block height estimation
      if (q.answer.includes('```')) {
        const preBlocks = (q.answer.match(/```/g) || []).length / 2;
        height += preBlocks * 130;
      }

      // Table height estimation
      if (q.answer.includes('|')) {
        const rows = q.answer.split('\n').filter(line => line.trim().startsWith('|')).length;
        height += rows * 38;
      }

      // Bullet points height estimation
      if (q.answer.includes('- ') || q.answer.includes('* ')) {
        const items = (q.answer.match(/^[-\*]\s+/gm) || []).length;
        height += items * 10;
      }

      // Technical diagrams height estimation
      if (q.diagrams && q.diagrams.length > 0) {
        height += q.diagrams.length * 300;
      }
    }

    return height;
  };

  const handleRowsRendered = (visibleRows: { startIndex: number; stopIndex: number }) => {
    const { startIndex } = visibleRows;
    // Scroll-Spy tracker using topmost visible index
    for (let i = startIndex; i >= 0; i--) {
      const item = virtualItems[i];
      if (item && item.type === 'header') {
        const cleanId = item.label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        selectCategory(cleanId);
        break;
      }
    }
  };

  // Generate dynamic key to force List component remount and clear cached layout heights
  const listKey = useMemo(() => {
    return `${virtualItems.length}-${expandedCards.join(',')}`;
  }, [virtualItems, expandedCards]);

  return (
    <List<RowProps>
      key={listKey}
      listRef={listRef as any}
      rowCount={virtualItems.length}
      rowHeight={getItemHeight}
      rowComponent={Row}
      rowProps={{ virtualItems }}
      onRowsRendered={handleRowsRendered}
      style={{ height: listHeight, width: '100%', overflowX: 'hidden' }}
    />
  );
};
