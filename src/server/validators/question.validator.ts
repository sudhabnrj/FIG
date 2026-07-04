import { z } from 'zod';

export const getQuestionsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.string().optional().transform((val) => (val ? val.split(',').map(t => t.trim()) : undefined)),
  featured: z.string().optional().transform((val) => (val === 'true')),
  sort: z.string().optional(),
  search: z.string().optional(),
});
