import { NextResponse } from 'next/server';
import { dbConnect } from '@/server/config/database';
import { Question } from '@/server/models/Question';
import { Answer } from '@/server/models/Answer';
import { Category } from '@/server/models/Category';
import { User } from '@/server/models/User';
import { withErrorHandler } from '@/server/middlewares/errorHandler';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async () => {
  await dbConnect();

  const [questionsCount, answersCount, categoriesCount] = await Promise.all([
    Question.countDocuments({ isPublished: true }),
    Answer.countDocuments({ status: 'approved' }),
    Category.countDocuments(),
  ]);

  // Find distinct authors of active questions and approved answers
  const [questionAuthors, answerAuthors] = await Promise.all([
    Question.distinct('authorId', { isPublished: true }),
    Answer.distinct('authorId', { status: 'approved' }),
  ]);

  const uniqueContributors = new Set([
    ...questionAuthors.map((id) => id?.toString()),
    ...answerAuthors.map((id) => id?.toString()),
  ].filter(Boolean));

  // Base fallback numbers if DB is not populated yet
  return NextResponse.json({
    success: true,
    data: {
      questions: questionsCount || 86,
      answers: answersCount || 54,
      categories: categoriesCount || 5,
      contributors: Math.max(uniqueContributors.size, 16),
    },
  });
});
