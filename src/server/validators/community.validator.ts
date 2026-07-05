import { z } from 'zod';

export const questionValidator = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(150, 'Title must not exceed 150 characters'),
  summary: z
    .string()
    .max(300, 'Summary must not exceed 300 characters')
    .optional()
    .default(''),
  question: z
    .string()
    .min(100, 'Question description must be at least 100 characters'),
  answer: z
    .string()
    .min(20, 'Answer expectation must be at least 20 characters'),
  category: z
    .string()
    .min(1, 'Category is required'),
  subCategory: z.string().optional().default(''),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
});

export const answerValidator = z.object({
  questionId: z.string().min(1, 'Question reference is required'),
  content: z
    .string()
    .min(50, 'Answer content must be at least 50 characters'),
  attachments: z.array(z.string()).default([]),
});

export const draftValidator = z.object({
  questionId: z.string().optional(),
  answerId: z.string().optional(),
  title: z.string().optional().default(''),
  draftContent: z.string().min(1, 'Draft content is required'),
  metadata: z.record(z.string(), z.any()).optional().default({}),
});

export const reviewActionValidator = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  action: z.enum(['approved', 'rejected', 'needs_revision']),
  notes: z.string().optional().default(''),
});
