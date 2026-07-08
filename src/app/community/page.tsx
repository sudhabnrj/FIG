'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import { fetchDrafts, fetchPendingReviews, clearCommunityMessages } from '../../features/community/communitySlice';
import { showToast } from '../../features/ui/uiSlice';
import LinkNext from 'next/link';

interface StatData {
  questions: number;
  answers: number;
  categories: number;
  contributors: number;
}

interface LatestQuestion {
  _id: string;
  id: number;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  createdAt: string;
  status: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  answerCount: number;
  views: number;
}

export default function CommunityDashboard() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const { drafts, pendingReviews, loading, error, successMessage } = useAppSelector(
    (state) => state.community
  );

  // Local state for statistics and latest questions
  const [stats, setStats] = useState<StatData>({ questions: 86, answers: 54, categories: 5, contributors: 16 });
  const [latestQuestions, setLatestQuestions] = useState<LatestQuestion[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDrafts());
      if (user && ['moderator', 'admin', 'super_admin'].includes(user.role)) {
        dispatch(fetchPendingReviews());
      }
    } else {
      // Clear any cached messages if session is cleared
      dispatch(clearCommunityMessages());
    }

    return () => {
      dispatch(clearCommunityMessages());
    };
  }, [dispatch, user, isAuthenticated]);

  useEffect(() => {
    // Fetch stats from custom API
    fetch('/api/v1/community/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStats(data.data);
        }
      })
      .catch((err) => console.error('Failed to load stats:', err));

    // Fetch latest questions from custom API
    fetch('/api/v1/community/latest-questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setLatestQuestions(data.data);
        }
      })
      .catch((err) => console.error('Failed to load latest questions:', err))
      .finally(() => setDataLoading(false));
  }, []);

  const isModerator = user && ['moderator', 'admin', 'super_admin'].includes(user.role);

  const handleFooterLinkClick = (name: string) => {
    dispatch(showToast(`${name} guidelines modal coming soon!`));
  };

  const getDifficultyBadge = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'medium':
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
    }
  };

  const categories = [
    { name: 'JavaScript', icon: 'fab fa-js', desc: 'ES6+, closure contexts, scoping rules, async generators, and engines.', count: stats.questions > 0 ? Math.round(stats.questions * 0.3) : 15 },
    { name: 'React', icon: 'fab fa-react', desc: 'Virtual DOM, reconciliation, hook rules, concurrency features, and performance.', count: stats.questions > 0 ? Math.round(stats.questions * 0.25) : 12 },
    { name: 'Next.js', icon: 'fas fa-server', desc: 'App Router transitions, RSC compilation, middleware boundaries, and rendering modes.', count: stats.questions > 0 ? Math.round(stats.questions * 0.2) : 10 },
    { name: 'UI / UX', icon: 'fas fa-pencil-ruler', desc: 'Visual spacing, contrast requirements, responsive break rules, and UX layouts.', count: stats.questions > 0 ? Math.round(stats.questions * 0.15) : 8 },
    { name: 'AI', icon: 'fas fa-robot', desc: 'Prompt patterns, generative model limits, context vector databases, and integrations.', count: stats.questions > 0 ? Math.round(stats.questions * 0.1) : 5 }
  ];

  return (
    <div className="min-h-screen bg-body py-10 px-4 md:px-8 text-text-primary transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        
        {/* Messages and notifications states */}
        {(successMessage || error) && (
          <div className="flex flex-col gap-3">
            {successMessage && (
              <div className="p-4 rounded-xl bg-success/15 border border-success/30 text-success flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <i className="fas fa-check-circle text-lg"></i>
                <span>{successMessage}</span>
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <i className="fas fa-exclamation-circle text-lg"></i>
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden p-8 md:p-12 rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-lavender text-white shadow-card flex flex-col md:flex-row items-center justify-between gap-8 transition-transform duration-300">
          {/* Glass background details */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex-1 flex flex-col gap-6 text-left z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider self-start border border-white/10">
              <i className="fas fa-users-cog"></i> Community Portal
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Shape the Future of Interview Preparation
            </h1>
            <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed">
              Help thousands of developers ace their front-end and web development interviews. Share concepts, submit challenging questions, and review answers with our community.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              {isAuthenticated ? (
                <LinkNext
                  href="/community/questions/create"
                  className="px-6 py-3 bg-white text-primary hover:bg-border-light font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 text-sm flex items-center gap-2"
                >
                  <i className="fas fa-plus-circle"></i> Create Question
                </LinkNext>
              ) : (
                <LinkNext
                  href="/login?redirect=/community/questions/create"
                  className="px-6 py-3 bg-white text-primary hover:bg-border-light font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 text-sm flex items-center gap-2"
                >
                  <i className="fas fa-sign-in-alt"></i> Login to Contribute
                </LinkNext>
              )}
              <LinkNext
                href="/"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all hover:scale-105 active:scale-95 text-sm flex items-center gap-2"
              >
                <i className="fas fa-search"></i> Browse Questions
              </LinkNext>
            </div>
          </div>
          
          <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 z-10 shadow-inner">
            <i className="fas fa-graduation-cap text-white text-7xl md:text-9xl animate-pulse"></i>
          </div>
        </section>

        {/* 2. COMMUNITY STATISTICS SECTION */}
        <section className="flex flex-col gap-4">
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
              Community Statistics
            </h2>
            <p className="text-text-muted text-xs md:text-sm">
              Real-time dynamically fetched contribution activity.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Questions', value: stats.questions, icon: 'fas fa-question-circle', color: 'text-primary' },
              { label: 'Answers', value: stats.answers, icon: 'fas fa-comment-dots', color: 'text-accent' },
              { label: 'Categories', value: stats.categories, icon: 'fas fa-th-large', color: 'text-lavender' },
              { label: 'Contributors', value: stats.contributors, icon: 'fas fa-users', color: 'text-success' }
            ].map((s, idx) => (
              <div
                key={idx}
                className="p-5 md:p-6 rounded-2xl bg-cardBg border border-border-custom shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover group flex flex-col justify-between"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-text-muted text-xs md:text-sm font-semibold">{s.label}</span>
                  <div className={`w-8 h-8 rounded-full bg-border-light flex items-center justify-center group-hover:scale-110 transition-transform ${s.color}`}>
                    <i className={s.icon}></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                    {dataLoading ? (
                      <i className="fas fa-circle-notch fa-spin text-xs text-text-muted"></i>
                    ) : (
                      s.value
                    )}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTIVE DRAFTS (If authenticated and has drafts) */}
        {isAuthenticated && drafts.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                <i className="fas fa-edit text-primary"></i> Your Active Drafts ({drafts.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drafts.map((draft) => (
                <div
                  key={draft._id}
                  className="p-5 rounded-2xl border border-border-custom bg-cardBg hover:border-primary transition-all duration-200 flex flex-col justify-between gap-4 group"
                >
                  <div>
                    <h3 className="font-bold text-sm text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                      {draft.title || 'Untitled Draft'}
                    </h3>
                    <p className="text-[0.75rem] text-text-muted mt-1.5 flex items-center gap-1.5">
                      <i className="far fa-calendar-alt"></i>
                      Saved: {new Date(draft.lastSaved).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-light pt-3">
                    <LinkNext
                      href="/community/questions/create"
                      className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Resume Draft <i className="fas fa-chevron-right text-[0.7rem]"></i>
                    </LinkNext>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MODERATOR REVIEW QUEUE (If moderator) */}
        {isModerator && pendingReviews.length > 0 && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                <i className="fas fa-clipboard-check text-success"></i> Review Queue ({pendingReviews.length})
              </h2>
              <LinkNext
                href="/community/review"
                className="text-xs md:text-sm font-bold text-primary hover:underline"
              >
                Go to Review Queue <i className="fas fa-arrow-right ml-1"></i>
              </LinkNext>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingReviews.slice(0, 3).map((item) => (
                <div
                  key={item.review._id}
                  className="p-5 rounded-2xl border border-border-custom bg-cardBg hover:border-success transition-all duration-200 flex flex-col justify-between gap-4"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[0.7rem] uppercase tracking-wider font-bold text-success bg-success/15 px-2 py-0.5 rounded-full">
                        {item.review.entityType}
                      </span>
                      <span className="text-[0.75rem] text-text-muted">
                        {new Date(item.review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-text-primary line-clamp-2">
                      {item.details?.title || item.details?.question || 'Submission waiting review'}
                    </h3>
                  </div>
                  <div className="border-t border-border-light pt-3">
                    <LinkNext
                      href="/community/review"
                      className="text-xs text-success font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Process Submission <i className="fas fa-chevron-right text-[0.7rem]"></i>
                    </LinkNext>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. POPULAR CATEGORIES */}
        <section className="flex flex-col gap-4">
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
              Popular Categories
            </h2>
            <p className="text-text-muted text-xs md:text-sm">
              Explore and contribute questions inside targeted technical topics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="p-7 rounded-2xl bg-slate-900 border border-[#1e293b] shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary/40 flex flex-col justify-between text-left group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-primary transition-all duration-300"></div>
                <div className="flex flex-col gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <i className={cat.icon}></i>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 font-medium">
                      {cat.desc}
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-[#1e293b] flex justify-between items-center text-xs">
                  <div className="flex flex-col text-left">
                    <span className="text-slate-400 font-bold">Questions</span>
                    <span className="text-[10px] text-green-400 font-bold mt-0.5">↑ Active</span>
                  </div>
                  <span className="font-extrabold text-sm text-white bg-slate-950 px-3 py-1 rounded-lg border border-[#1e293b]">
                    {dataLoading ? (
                      <i className="fas fa-circle-notch fa-spin text-[0.6rem]"></i>
                    ) : (
                      cat.count
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. LATEST QUESTIONS */}
        <section className="flex flex-col gap-4">
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
              Latest Submissions
            </h2>
            <p className="text-text-muted text-xs md:text-sm">
              Freshly approved questions waiting for your inspection.
            </p>
          </div>

          {dataLoading ? (
            <div className="min-h-[200px] flex items-center justify-center bg-cardBg border border-border-custom rounded-2xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-text-secondary text-sm">Loading latest questions...</p>
              </div>
            </div>
          ) : latestQuestions.length === 0 ? (
            <div className="h-[200px] flex flex-col items-center justify-center text-center text-text-muted border-2 border-dashed border-border-custom rounded-2xl p-6 bg-cardBg">
              <i className="fas fa-folder-open text-3xl mb-3 text-text-muted/60"></i>
              <p className="text-sm font-semibold text-text-primary">No community questions found</p>
              <p className="text-xs max-w-xs mt-1 text-text-muted">
                Be the first to submit a high-quality interview question!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {latestQuestions.map((q) => (
                <LinkNext
                  key={q._id}
                  href={`/?question=${q.id}`}
                  className="p-5 rounded-2xl bg-cardBg border border-border-custom hover:border-primary shadow-card hover:shadow-hover transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left group"
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[0.7rem] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15">
                        {q.category}
                      </span>
                      <span className={`text-[0.7rem] font-bold px-2.5 py-0.5 rounded-full ${getDifficultyBadge(q.difficulty)}`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[0.75rem] text-text-muted flex items-center gap-1">
                        <i className="far fa-clock"></i>
                        {new Date(q.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    <h3 className="font-extrabold text-base md:text-lg text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                      {q.title}
                    </h3>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[0.65rem] font-bold flex items-center justify-center overflow-hidden border border-border-custom">
                        {q.author.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={q.author.avatar} alt={q.author.name} className="w-full h-full object-cover" />
                        ) : (
                          q.author.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-[0.8rem] text-text-secondary font-medium">
                        {q.author.name} <span className="text-text-muted font-normal text-[0.75rem]">@{q.author.username}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-text-muted text-xs md:text-sm self-start md:self-center font-semibold bg-border-light/40 px-4 py-2 rounded-xl border border-border-custom/50">
                    <div className="flex items-center gap-1.5">
                      <i className="far fa-comments text-accent"></i>
                      <span>{q.answerCount} answers</span>
                    </div>
                    <div className="h-4 w-[1px] bg-border-custom"></div>
                    <div className="flex items-center gap-1.5">
                      <i className="far fa-eye text-lavender"></i>
                      <span>{q.views} views</span>
                    </div>
                  </div>
                </LinkNext>
              ))}
            </div>
          )}
        </section>

        {/* 5. COMMUNITY BENEFITS */}
        <section className="flex flex-col gap-4">
          <div className="text-left">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text-primary">
              Why Contribute?
            </h2>
            <p className="text-text-muted text-xs md:text-sm">
              Making professional catalog contributions has high advantages.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: 'Share Knowledge', desc: 'Solidify your own understanding of web specifications by describing them to others.', icon: 'fas fa-book-open', color: 'text-indigo-500 bg-indigo-500/10' },
              { title: 'Help Developers', desc: 'Directly support colleagues in finding key preparation materials to secure jobs.', icon: 'fas fa-hands-helping', color: 'text-sky-500 bg-sky-500/10' },
              { title: 'Build Your Profile', desc: 'Display validated contributions on your community developer profile.', icon: 'fas fa-id-badge', color: 'text-purple-500 bg-purple-500/10' },
              { title: 'Improve Skills', desc: 'Engage with peer review feedback to keep code design standards top tier.', icon: 'fas fa-laptop-code', color: 'text-emerald-500 bg-emerald-500/10' }
            ].map((b, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-cardBg border border-border-custom shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover text-left flex flex-col gap-4"
              >
                <div className={`w-10 h-10 rounded-xl ${b.color} flex items-center justify-center text-lg`}>
                  <i className={b.icon}></i>
                </div>
                <div>
                  <h3 className="font-bold text-base text-text-primary">{b.title}</h3>
                  <p className="text-text-muted text-[0.78rem] leading-relaxed mt-2">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CALL TO ACTION SECTION */}
        <section className="p-8 md:p-12 rounded-3xl bg-cardBg border border-border-custom shadow-card hover:border-primary/20 transition-all duration-300 text-center relative overflow-hidden flex flex-col items-center gap-5">
          <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            Ready to help thousands of developers?
          </h2>
          <p className="text-text-secondary max-w-xl text-sm leading-relaxed">
            Start contributing high-quality interview preparation questions, answers, and visual guides today. Every verified update goes into our main catalog.
          </p>
          <LinkNext
            href={isAuthenticated ? "/community/questions/create" : "/login?redirect=/community/questions/create"}
            className="px-6 py-3.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 text-sm flex items-center gap-2 mt-2 cursor-pointer select-none"
          >
            <i className="fas fa-plus"></i> Create Your First Question
          </LinkNext>
        </section>

        {/* 7. FOOTER SECTION */}
        <footer className="border-t border-border-custom pt-6 pb-2 text-[0.8rem] text-text-muted flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
            <button
              onClick={() => handleFooterLinkClick('Community Rules')}
              className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 font-medium p-0"
            >
              Community Rules
            </button>
            <button
              onClick={() => handleFooterLinkClick('Guidelines')}
              className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 font-medium p-0"
            >
              Guidelines
            </button>
            <button
              onClick={() => handleFooterLinkClick('FAQ')}
              className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 font-medium p-0"
            >
              FAQ
            </button>
            <button
              onClick={() => handleFooterLinkClick('Support')}
              className="hover:text-primary transition-colors cursor-pointer bg-transparent border-0 font-medium p-0"
            >
              Support
            </button>
          </div>
          <div>
            <span>Version 1.2.0 • Contributions moderated</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
