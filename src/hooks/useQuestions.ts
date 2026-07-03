import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { toggleCard, expandAll, collapseAll } from '../features/questions/questionsSlice';
import { showToast } from '../features/ui/uiSlice';
import { copyToClipboard } from '../utils/copyToClipboard';

export const useQuestions = () => {
  const dispatch = useAppDispatch();
  const { questions, isLoading, error, expandedCards } = useAppSelector((state) => state.questions);
  const searchQuery = useAppSelector((state) => state.search.query);
  const categoriesOrder = useAppSelector((state) => state.categories.categoriesOrder);

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

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, typeof questions> = {};
    categoriesOrder.forEach((cat) => {
      groups[cat] = filteredQuestions.filter((q) => q.category === cat);
    });
    return groups;
  }, [filteredQuestions, categoriesOrder]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categoriesOrder.forEach((cat) => {
      counts[cat] = filteredQuestions.filter((q) => q.category === cat).length;
    });
    return counts;
  }, [filteredQuestions, categoriesOrder]);

  const handleCopyQuestion = useCallback((id: number) => {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    copyToClipboard(
      `Question #${q.id} [Category: ${q.category}]\n\nQuestion:\n${q.question}`,
      () => dispatch(showToast('Question copied successfully'))
    );
  }, [questions, dispatch]);

  const handleCopyAnswer = useCallback((id: number) => {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    copyToClipboard(
      `Answer to Question #${q.id}:\n\n${q.answer.replace(/<[^>]*>/g, '')}`,
      () => dispatch(showToast('Answer copied successfully'))
    );
  }, [questions, dispatch]);

  const handleCopyFullQA = useCallback((id: number) => {
    const q = questions.find((item) => item.id === id);
    if (!q) return;
    copyToClipboard(
      `Question #${q.id} [Category: ${q.category}]\n\nQuestion:\n${q.question}\n\nAnswer:\n${q.answer.replace(/<[^>]*>/g, '')}`,
      () => dispatch(showToast('Question & Answer copied successfully'))
    );
  }, [questions, dispatch]);

  const handleToggleCard = useCallback((id: number) => {
    dispatch(toggleCard(id));
  }, [dispatch]);

  const handleExpandAll = useCallback(() => {
    dispatch(expandAll(filteredQuestions.map((q) => q.id)));
  }, [dispatch, filteredQuestions]);

  const handleCollapseAll = useCallback(() => {
    dispatch(collapseAll());
  }, [dispatch]);

  const isCardExpanded = useCallback((id: number) => {
    return expandedCards.includes(id);
  }, [expandedCards]);

  return {
    questions,
    filteredQuestions,
    groupedQuestions,
    categoryCounts,
    isLoading,
    error,
    handleCopyQuestion,
    handleCopyAnswer,
    handleCopyFullQA,
    handleToggleCard,
    handleExpandAll,
    handleCollapseAll,
    isCardExpanded,
  };
};
