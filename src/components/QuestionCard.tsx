import React, { useMemo } from 'react';
import { Question } from '../types';
import { questionsService } from '../services/questionsService';

interface QuestionCardProps {
  question: Question;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
  onCopyQuestion: (id: number) => void;
  onCopyAnswer: (id: number) => void;
  onCopyFullQA: (id: number) => void;
}

const badgeColors: Record<string, string> = {
  'AI': 'bg-lavender text-white',
  'UI / UX': 'bg-accent text-white',
  'React': 'bg-[#0ea5e9] text-white',
  'JavaScript': 'bg-[#eab308] text-[#0f172a]',
  'Next.js': 'bg-black text-white'
};

const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query) return text;
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const highlightHtml = (htmlContent: string, query: string): string => {
  if (!query) return htmlContent;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${htmlContent}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;
  if (!container) return htmlContent;

  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'gi');

  const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const nodes: Text[] = [];
  let node: Node | null;
  while (node = walk.nextNode()) {
    nodes.push(node as Text);
  }

  nodes.forEach(textNode => {
    const parent = textNode.parentNode as HTMLElement;
    if (parent && parent.tagName !== 'SCRIPT' && parent.tagName !== 'STYLE' && parent.tagName !== 'MARK' && parent.tagName !== 'A') {
      const text = textNode.nodeValue || '';
      if (regex.test(text)) {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        
        text.replace(regex, (match, index) => {
          if (index > lastIndex) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex, index)));
          }
          
          const mark = document.createElement('mark');
          mark.className = 'search-highlight';
          mark.textContent = match;
          fragment.appendChild(mark);
          
          lastIndex = index + match.length;
          return match;
        });
        
        if (lastIndex < text.length) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        
        parent.replaceChild(fragment, textNode);
      }
    }
  });

  return container.innerHTML;
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isExpanded,
  onToggle,
  searchQuery,
  onCopyQuestion,
  onCopyAnswer,
  onCopyFullQA,
}) => {
  // Estimate reading time
  const readingTime = useMemo(() => {
    const textToCount = question.question + ' ' + question.answer.replace(/<[^>]*>/g, '');
    const wordCount = textToCount.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }, [question]);

  const parsedAnswerHtml = useMemo(() => {
    return questionsService.parseMarkdown(question.answer);
  }, [question.answer]);

  const highlightedAnswerHtml = useMemo(() => {
    return highlightHtml(parsedAnswerHtml, searchQuery);
  }, [parsedAnswerHtml, searchQuery]);

  const badgeClass = badgeColors[question.category] || 'bg-primary text-white';

  return (
    <div
      id={`card-${question.id}`}
      className="bg-cardBg border border-border-custom rounded-lg shadow-card transition-all duration-300 mb-6 overflow-hidden relative before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-transparent before:transition-all before:duration-300 hover:-translate-y-1 hover:shadow-hover hover:border-primary-light hover:before:bg-primary"
    >
      <div className="px-6 py-4 bg-transparent border-0 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`text-[0.75rem] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
            {highlightText(question.category, searchQuery)}
          </span>
          <span className="text-text-muted font-semibold text-[0.85rem]">
            Question #{question.id}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[0.8rem] text-text-muted font-medium">
          <span>
            <i className="far fa-clock mr-1"></i> {readingTime} min read
          </span>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0">
        <div
          onClick={onToggle}
          className="flex justify-between items-center gap-6 w-full cursor-pointer py-1.5 rounded transition-all select-none"
        >
          <h3 className="text-xl font-bold leading-snug text-text-primary transition-all hover:text-primary">
            {highlightText(question.question, searchQuery)}
          </h3>
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-border-light text-text-muted transition-all duration-300 flex-shrink-0 ${
              isExpanded ? 'rotate-180 bg-primary text-white' : 'hover:bg-primary-light hover:text-primary'
            }`}
          >
            <i className="fas fa-chevron-down"></i>
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 print:hidden">
          <button
            onClick={() => onCopyQuestion(question.id)}
            className="bg-none border-0 text-text-muted px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all hover:bg-border-light hover:text-text-primary cursor-pointer select-none"
          >
            <i className="far fa-copy"></i> Copy Q
          </button>
          <button
            onClick={() => onCopyAnswer(question.id)}
            className="bg-none border-0 text-text-muted px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all hover:bg-border-light hover:text-text-primary cursor-pointer select-none"
          >
            <i className="far fa-copy"></i> Copy A
          </button>
          <button
            onClick={() => onCopyFullQA(question.id)}
            className="bg-none border-0 text-text-muted px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-all hover:bg-border-light hover:text-text-primary cursor-pointer select-none"
          >
            <i className="far fa-copy"></i> Copy Q&A
          </button>
        </div>

        {/* Collapsible Answer Body */}
        <div
          className={`grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4 border-t border-border-light pt-4' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="answer-container text-text-secondary text-[0.975rem] leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: highlightedAnswerHtml }} />

              {/* Lazy Loaded Diagrams rendering */}
              {question.diagrams && question.diagrams.length > 0 && (
                <div className="mt-5 grid gap-4">
                  {question.diagrams.map((diagPath, idx) => (
                    <div
                      key={idx}
                      className="rounded-md overflow-hidden border border-border-custom bg-black text-center shadow-card"
                    >
                      <img
                        src={diagPath}
                        alt="Technical Diagram"
                        className="max-w-full h-auto inline-block align-middle"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
