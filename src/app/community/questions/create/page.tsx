'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LinkNext from 'next/link';
import { useAppDispatch, useAppSelector } from '../../../../hooks/store';
import { submitQuestion, saveDraft, fetchDrafts, clearCommunityMessages } from '../../../../features/community/communitySlice';
import TiptapEditor from '../../../../components/editor/TiptapEditor';

export default function CreateQuestionPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, successMessage, drafts } = useAppSelector((state) => state.community);

  // Form states
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [questionContent, setQuestionContent] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Suggesting Category
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Refs for tracking changes
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formStateRef = useRef({ title, summary, category, subCategory, difficulty, tags, questionContent, answerContent, attachments });

  // Update current state ref
  useEffect(() => {
    formStateRef.current = { title, summary, category, subCategory, difficulty, tags, questionContent, answerContent, attachments };
  }, [title, summary, category, subCategory, difficulty, tags, questionContent, answerContent, attachments]);

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
        setSummary(metadata.summary || '');
        setCategory(metadata.category || '');
        setSubCategory(metadata.subCategory || '');
        setDifficulty(metadata.difficulty || 'medium');
        setTags(metadata.tags || []);
        setQuestionContent(draft.draftContent || '');
        setAnswerContent(metadata.answer || '');
        setAttachments(metadata.attachments || []);
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
      if (state.title || state.questionContent || state.answerContent) {
        dispatch(
          saveDraft({
            title: state.title,
            draftContent: state.questionContent,
            metadata: {
              summary: state.summary,
              category: state.category,
              subCategory: state.subCategory,
              difficulty: state.difficulty,
              tags: state.tags,
              answer: state.answerContent,
              attachments: state.attachments,
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
          summary,
          category,
          subCategory,
          difficulty,
          tags,
          answer: answerContent,
          attachments,
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

  // Upload attachment
  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must not exceed 5MB');
        return;
      }
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/v1/community/uploads', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setAttachments([...attachments, data.url]);
        } else {
          alert(data.errors?.[0] || 'Upload failed');
        }
      } catch (err) {
        alert('Attachment upload failed');
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleRemoveAttachment = (idxToRemove: number) => {
    setAttachments(attachments.filter((_, idx) => idx !== idxToRemove));
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
    if (answerContent.replace(/<[^>]*>/g, '').length < 20) {
      alert('Expected answer must be at least 20 characters of text content');
      return;
    }
    if (!category) {
      alert('Category is required');
      return;
    }

    const questionData = {
      title,
      summary,
      question: questionContent,
      answer: answerContent,
      category,
      subCategory,
      difficulty,
      tags,
      attachments,
    };

    const res = await dispatch(submitQuestion(questionData));
    if (submitQuestion.fulfilled.match(res)) {
      router.push('/community');
    }
  };

  return (
    <div className="min-h-screen bg-bg-body py-10 px-4 md:px-8 text-text-primary">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <LinkNext href="/community" className="text-sm text-color-primary font-bold hover:underline flex items-center gap-2">
            <i className="fas fa-arrow-left"></i> Back to Community Portal
          </LinkNext>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleManualSave}
              className="px-4 py-2 border border-border-color bg-bg-card hover:bg-border-light rounded-xl text-sm font-semibold transition-all"
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
        <form onSubmit={handleSubmit} className="bg-bg-card border border-border-color rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-1 text-text-primary">Create Interview Question</h1>
            <p className="text-xs text-text-muted">Draft and submit your question for review. Keep guidelines in mind.</p>
          </div>

          <hr className="border-border-color" />

          {/* Title & Summary */}
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

            <div className="flex flex-col gap-1.5">
              <label htmlFor="summary" className="text-sm font-bold text-text-secondary">
                Summary / Abstract
              </label>
              <textarea
                id="summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of what this question tests (max 300 characters)..."
                maxLength={300}
                className="px-4 py-3 rounded-xl border border-border-color bg-bg-body focus:ring-2 focus:ring-color-primary focus:outline-none transition-all text-sm w-full resize-none"
              />
            </div>
          </div>

          {/* Taxonomy row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <option value="React">React</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Next.js">Next.js</option>
                    <option value="UI / UX">UI / UX</option>
                    <option value="AI">AI</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSuggestingCategory(true)}
                    className="p-3 bg-border-light hover:bg-border-color text-text-secondary rounded-xl transition-all"
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
                    className="px-3 py-2 bg-color-primary hover:bg-indigo-700 text-white font-bold rounded-xl text-xs"
                  >
                    Set
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuggestingCategory(false)}
                    className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="subCategory" className="text-sm font-bold text-text-secondary">
                Subcategory
              </label>
              <input
                type="text"
                id="subCategory"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="e.g. State Management"
                className="px-4 py-3 rounded-xl border border-border-color bg-bg-body focus:ring-2 focus:ring-color-primary focus:outline-none transition-all text-sm w-full"
              />
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
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-color-primary-light text-color-primary dark:text-indigo-300 rounded-lg text-xs font-semibold"
                  >
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(idx)} className="hover:text-red-500">
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

          {/* Answer expected content */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-text-secondary">
              Expected Answer / Key Verification Metrics <span className="text-red-500">*</span>
            </label>
            <TiptapEditor content={answerContent} onChange={setAnswerContent} placeholder="Define what a candidate must mention or write to pass this question successfully..." />
          </div>

          {/* Attachments Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-text-secondary">
              Attachments (Images, PDF, ZIP, Markdown - max 10)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="file-attachment"
                onChange={handleUploadAttachment}
                disabled={uploadingFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('file-attachment')?.click()}
                disabled={uploadingFile || attachments.length >= 10}
                className="px-4 py-2 border border-border-color hover:bg-border-light text-text-secondary rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              >
                {uploadingFile ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-paperclip mr-2"></i>}
                Attach File
              </button>
            </div>
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {attachments.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border border-border-color rounded-lg bg-bg-body text-xs">
                    <span className="truncate max-w-[250px] font-medium">{url.split('/').pop()}</span>
                    <button type="button" onClick={() => handleRemoveAttachment(idx)} className="text-red-500 hover:text-red-700">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-border-color" />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <LinkNext
              href="/community"
              className="px-5 py-3 border border-border-color hover:bg-border-light rounded-xl text-sm font-semibold transition-all text-text-secondary"
            >
              Cancel
            </LinkNext>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-color-primary hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-sm"
            >
              {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-paper-plane mr-2"></i>}
              Submit Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
