'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LinkNext from 'next/link';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { submitQuestion, saveDraft, fetchDrafts, clearCommunityMessages } from '../../../../features/community/communitySlice';
import TiptapEditor from '../../../../components/editor/TiptapEditor';
import { CommunityAuthGuard } from '../../../../components/auth/CommunityAuthGuard';

export default function CreateQuestionPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, successMessage, drafts } = useAppSelector((state) => state.community);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [questionContent, setQuestionContent] = useState('');
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // Suggesting Category
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Refs for tracking changes
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formStateRef = useRef({ title, category, difficulty, tags, questionContent });

  // Update current state ref
  useEffect(() => {
    formStateRef.current = { title, category, difficulty, tags, questionContent };
  }, [title, category, difficulty, tags, questionContent]);

  // Fetch db categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setDbCategories(json.data);
        }
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Load draft if user has one
  useEffect(() => {
    dispatch(fetchDrafts());
    return () => {
      dispatch(clearCommunityMessages());
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [dispatch]);

  // Populate first available draft
  useEffect(() => {
    if (drafts.length > 0 && !title && !questionContent) {
      const draft = drafts[0];
      setTitle(draft.title || '');
      try {
        const metadata = draft.metadata || {};
        setCategory(metadata.category || '');
        setDifficulty(metadata.difficulty || 'medium');
        setTags(metadata.tags || []);
        setQuestionContent(draft.draftContent || '');
      } catch (e) {
        console.error('Failed to restore draft metadata:', e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drafts]);

  // Autosave setup (every 30 seconds)
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      const state = formStateRef.current;
      if (state.title || state.questionContent) {
        dispatch(
          saveDraft({
            title: state.title,
            draftContent: state.questionContent,
            metadata: {
              category: state.category,
              difficulty: state.difficulty,
              tags: state.tags,
            },
          })
        );
      }
    }, 30000);

    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [dispatch]);

  // Save manual draft
  const handleManualSave = () => {
    dispatch(
      saveDraft({
        title,
        draftContent: questionContent,
        metadata: {
          category,
          difficulty,
          tags,
        },
      })
    );
  };

  // Add tag handler
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (idxToRemove: number) => {
    setTags(tags.filter((_, idx) => idx !== idxToRemove));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.length < 10) {
      alert('Title must be at least 10 characters');
      return;
    }
    if (questionContent.replace(/<[^>]*>/g, '').length < 100) {
      alert('Question description must be at least 100 characters of text content');
      return;
    }
    if (!category) {
      alert('Category is required');
      return;
    }

    const questionData = {
      title,
      question: questionContent,
      category,
      difficulty,
      tags,
    };

    const res = await dispatch(submitQuestion(questionData));
    if (submitQuestion.fulfilled.match(res)) {
      router.push('/community');
    }
  };

  return (
    <CommunityAuthGuard>
      <div className="min-h-screen bg-bg-body py-10 px-4 md:px-8 text-text-primary">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <LinkNext href="/community" className="text-sm text-color-primary font-bold hover:underline flex items-center gap-2 no-underline">
              <i className="fas fa-arrow-left"></i> Back to Community Portal
            </LinkNext>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleManualSave}
                className="px-4 py-2 text-white border-0 bg-primary hover:bg-primary/80 rounded-[4px] text-sm font-semibold transition-all cursor-pointer"
              >
                <i className="fas fa-save mr-2"></i> Save Draft
              </button>
            </div>
          </div>

          {/* Errors display */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center gap-3 text-sm">
              <i className="fas fa-exclamation-circle text-lg"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Content Form card */}
          <form onSubmit={handleSubmit} className="bg-bg-card bg-white border border-border-color rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight mb-1 text-text-primary">Create Interview Question</h1>
              <p className="text-xs text-text-muted">Draft and submit your question for review. Keep guidelines in mind.</p>
            </div>

            <hr className="border-border-color" />

            {/* Title */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-sm font-bold text-text-secondary">
                  Question Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. How does virtual DOM rendering optimize updates in React?"
                  required
                  className="px-4 py-3 rounded-xl border border-border-color bg-bg-body focus:ring-2 focus:ring-color-primary focus:outline-none transition-all text-sm w-full"
                />
              </div>
            </div>

            {/* Taxonomy row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-sm font-bold text-text-secondary">
                  Category <span className="text-red-500">*</span>
                </label>
                {!suggestingCategory ? (
                  <div className="flex gap-2">
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="px-4 py-3 rounded-xl border border-border-color bg-bg-body focus:ring-2 focus:ring-color-primary focus:outline-none transition-all text-sm w-full cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {dbCategories.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSuggestingCategory(true)}
                      className="p-3 bg-black hover:bg-black/80 text-white rounded-[4px] border-0 cursor-pointer transition-all"
                      title="Suggest Category"
                    >
                      <i className="fas fa-lightbulb"></i>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Suggest Category Name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="px-4 py-3 rounded-xl border border-border-color bg-bg-body focus:ring-2 focus:ring-color-primary focus:outline-none transition-all text-sm w-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCategoryName.trim()) {
                          setCategory(newCategoryName.trim());
                        }
                        setSuggestingCategory(false);
                      }}
                      className="px-3 py-2 bg-primary hover:bg-primary/80 text-white font-bold rounded-[4px] border-0 cursor-pointer text-xs"
                    >
                      Set
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuggestingCategory(false)}
                      className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-[4px] border-0 cursor-pointer transition-all"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="difficulty" className="text-sm font-bold text-text-secondary">
                  Difficulty <span className="text-red-500">*</span>
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  required
                  className="px-4 py-3 rounded-xl border border-border-color bg-bg-body focus:ring-2 focus:ring-color-primary focus:outline-none transition-all text-sm w-full cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tags" className="text-sm font-bold text-text-secondary">
                Tags (press Enter to add)
              </label>
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g. virtual-dom, rendering, performance"
                className="px-4 py-3 rounded-xl border border-border-color bg-bg-body focus:ring-2 focus:ring-color-primary focus:outline-none transition-all text-sm w-full"
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-color-primary-light text-color-primary dark:text-indigo-300 rounded-lg text-xs font-semibold animate-in fade-in"
                    >
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(idx)} className="hover:text-red-500 border-0 bg-transparent cursor-pointer p-0 text-[10px]">
                        <i className="fas fa-times-circle"></i>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Question text content */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text-secondary">
                Detailed Question Content <span className="text-red-500">*</span>
              </label>
              <TiptapEditor content={questionContent} onChange={setQuestionContent} placeholder="Explain the context, requirements, or instructions for this interview question..." />
            </div>

            <hr className="border-border-color" />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <LinkNext
                href="/community"
                className="px-5 py-3 border border-border-color hover:bg-border-light rounded-[4px] text-sm font-semibold transition-all text-text-secondary no-underline"
              >
                Cancel
              </LinkNext>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-3 bg-primary hover:bg-indigo-700 text-white font-bold rounded-[4px] shadow transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-sm cursor-pointer border-0"
              >
                {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-paper-plane mr-2"></i>}
                Submit Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </CommunityAuthGuard>
  );
}
