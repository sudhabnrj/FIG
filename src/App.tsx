import React, { useState, useEffect, useMemo } from 'react';
import { Question } from './types';
import { questionsService } from './services/questionsService';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Sidebar } from './components/Sidebar';
import { MobileSidebar } from './components/MobileSidebar';
import { QuestionCard } from './components/QuestionCard';
import { Toast } from './components/Toast';
import { ScrollToTop } from './components/ScrollToTop';

export const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ai');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastShow, setIsToastShow] = useState(false);

  // Fetch compiled Q&A dataset
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await questionsService.fetchQuestions();
        setQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions database.');
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const escapedQuery = searchQuery.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'gi');
    return questions.filter((q) => {
      const cleanAnswer = q.answer.replace(/<[^>]*>/g, '');
      return (
        q.question.match(regex) ||
        cleanAnswer.match(regex) ||
        q.category.match(regex)
      );
    });
  }, [questions, searchQuery]);

  // Group filtered questions by category in strict order
  const groupedQuestions = useMemo(() => {
    const categoriesOrder = ["AI", "UI / UX", "React", "JavaScript", "Next.js"];
    const groups: Record<string, Question[]> = {};
    categoriesOrder.forEach((cat) => {
      groups[cat] = filteredQuestions.filter((q) => q.category === cat);
    });
    return groups;
  }, [filteredQuestions]);

  // Category counts based on filtered items
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ["AI", "UI / UX", "React", "JavaScript", "Next.js"].forEach((cat) => {
      counts[cat] = filteredQuestions.filter((q) => q.category === cat).length;
    });
    return counts;
  }, [filteredQuestions]);

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
        setActiveCategory(currentCat);
      }
    };

    window.addEventListener('scroll', handleScroll);
    const timer = setTimeout(handleScroll, 500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [questions, searchQuery]);

  // Copy helper logic
  const triggerToast = (message: string) => {
    setToastMessage(message);
    setIsToastShow(true);
  };

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text).then(() => {
      triggerToast(successMessage);
    }).catch((err) => {
      console.error('Clipboard write error: ', err);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        triggerToast(successMessage);
      } catch (err2) {
        console.error('Fallback copy error: ', err2);
      }
      document.body.removeChild(textArea);
    });
  };

  const handleCopyQuestion = (id: number) => {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    copyToClipboard(
      `Question #${q.id} [Category: ${q.category}]\n\nQuestion:\n${q.question}`,
      'Question copied successfully'
    );
  };

  const handleCopyAnswer = (id: number) => {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    copyToClipboard(
      `Answer to Question #${q.id}:\n\n${q.answer.replace(/<[^>]*>/g, '')}`,
      'Answer copied successfully'
    );
  };

  const handleCopyFullQA = (id: number) => {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    copyToClipboard(
      `Question #${q.id} [Category: ${q.category}]\n\nQuestion:\n${q.question}\n\nAnswer:\n${q.answer.replace(/<[^>]*>/g, '')}`,
      'Question & Answer copied successfully'
    );
  };

  const handleToggleCard = (id: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedCards(new Set(filteredQuestions.map((q) => q.id)));
  };

  const handleCollapseAll = () => {
    setExpandedCards(new Set());
  };

  const handleCategoryClick = (category: string) => {
    const cleanId = category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + 'Section';
    const element = document.getElementById(cleanId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setActiveCategory(category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-body">
      {/* Sticky Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalQuestions={filteredQuestions.length}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Hero Banner */}
      <Hero totalQuestions={questions.length} />

      {/* Mobile Search input */}
      <div className="container md:hidden py-3 px-4 mx-auto">
        <div className="relative w-full">
          <i className="fas fa-search text-text-muted absolute left-4 top-1/2 -translate-y-1/2"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control w-full pl-10 pr-4 py-2.5 bg-white border border-border-custom rounded-lg shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm"
            placeholder="Search Q&A..."
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <main className="container-fluid py-6 px-4 md:px-8 mx-auto flex-1">
        <div className="row g-4 flex flex-col md:flex-row gap-6">
          {/* Desktop Left Sidebar */}
          <Sidebar
            activeCategory={activeCategory}
            categoryCounts={categoryCounts}
            onCategoryClick={handleCategoryClick}
            onExpandAll={handleExpandAll}
            onCollapseAll={handleCollapseAll}
          />

          {/* Right Main Column */}
          <section className="col-md-8 col-xl-8 flex-1 main-column">
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
                    We couldn't find any questions matching "{searchQuery}". Try different terms.
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
                            isExpanded={expandedCards.has(q.id)}
                            onToggle={() => handleToggleCard(q.id)}
                            searchQuery={searchQuery}
                            onCopyQuestion={handleCopyQuestion}
                            onCopyAnswer={handleCopyAnswer}
                            onCopyFullQA={handleCopyFullQA}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Drawer menu */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        activeCategory={activeCategory}
        categoryCounts={categoryCounts}
        onCategoryClick={handleCategoryClick}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-border-custom py-4 text-center mt-5 text-text-muted text-[0.85rem]">
        <div className="container mx-auto">
          <p className="mb-1">&copy; 2026 Interview Preparation Guide. All Rights Reserved.</p>
          <p className="mb-0 text-text-muted text-[0.75rem]">
            Redesigned & Modernized with Premium Accessibility and Responsive UX.
          </p>
        </div>
      </footer>

      {/* Back to top float button */}
      <ScrollToTop />

      {/* Toast notifications */}
      <Toast
        message={toastMessage}
        show={isToastShow}
        onClose={() => setIsToastShow(false)}
      />
    </div>
  );
};
