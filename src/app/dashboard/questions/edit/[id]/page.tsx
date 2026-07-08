'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/hooks/store';
import { showToast } from '@/features/ui/uiSlice';
import TiptapEditor from '@/components/editor/TiptapEditor';

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/questions/${params.id}`);
        const json = await res.json();
        if (json.success) {
          const q = json.data;
          setTitle(q.title || '');
          setSummary(q.summary || '');
          setCategory(q.category || '');
          setSubCategory(q.subCategory || '');
          setDifficulty(q.difficulty || 'medium');
          setTags(q.tags || []);
          setQuestionContent(q.question || '');
          setAnswerContent(q.answer || '');
          setAttachments(q.attachments || []);
        } else {
          setError(json.errors?.[0] || 'Question not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error occurred while loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [params.id]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 10) {
      dispatch(showToast('Title must be at least 10 characters long'));
      return;
    }
    if (questionContent.length < 100) {
      dispatch(showToast('Question description must be at least 100 characters long'));
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`/api/questions/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          question: questionContent,
          answer: answerContent,
          category,
          subCategory,
          difficulty,
          tags,
          attachments,
        }),
      });

      const json = await res.json();
      if (json.success) {
        dispatch(showToast('Question updated and sent back to moderation queue!'));
        router.push('/dashboard/questions');
      } else {
        dispatch(showToast(json.errors?.[0] || 'Update failed'));
      }
    } catch (err: any) {
      dispatch(showToast(err.message || 'Error saving question'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/15 border border-red-500/30 text-red-500 rounded-xl flex items-center gap-3">
        <i className="fas fa-exclamation-circle text-xl"></i>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Edit Question</h1>
          <p className="text-xs text-text-muted mt-1">Make adjustments to your question contribution. Submitting places it back in moderation.</p>
        </div>
        <Link href="/dashboard/questions" className="text-sm font-semibold text-text-secondary hover:text-primary no-underline">
          <i className="fas fa-arrow-left"></i> Back to List
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-cardBg border border-border-custom rounded-xl p-6 shadow-card space-y-6">
        {/* Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Question Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How does Virtual DOM rendering work in React?"
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of the concept being tested (max 300 chars)..."
                rows={3}
                maxLength={300}
                className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-sm resize-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. React"
                  className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Subcategory</label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="e.g. Performance"
                  className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e: any) => setDifficulty(e.target.value)}
                  className="w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Tags (Press Enter)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="e.g. vdom"
                  className="form-control w-full p-2.5 bg-body border border-border-custom rounded-lg focus:outline-none focus:border-primary text-sm"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      <span>{tag}</span>
                      <button type="button" onClick={() => handleRemoveTag(idx)} className="text-primary hover:text-red-500 bg-transparent border-0 cursor-pointer p-0">
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor for Question */}
        <div>
          <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Detailed Question Description</label>
          <div className="border border-border-custom rounded-lg overflow-hidden bg-body">
            <TiptapEditor content={questionContent} onChange={setQuestionContent} placeholder="Explain the question context, code snippets, or expectations..." />
          </div>
        </div>

        {/* Editor for Answer */}
        <div>
          <label className="block text-xs font-bold uppercase text-text-secondary mb-1">Expected Answer / Answer Breakdown</label>
          <div className="border border-border-custom rounded-lg overflow-hidden bg-body">
            <TiptapEditor content={answerContent} onChange={setAnswerContent} placeholder="Outline key topics, optimal answers, or performance considerations..." />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-custom">
          <Link href="/dashboard/questions" className="px-4 py-2 border border-border-custom rounded-lg text-text-secondary font-semibold hover:bg-border-light transition-all no-underline text-sm flex items-center justify-center">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-55 text-sm"
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                <span>Updating Question...</span>
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                <span>Submit Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
