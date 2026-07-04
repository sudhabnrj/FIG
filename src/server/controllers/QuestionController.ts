import { NextRequest, NextResponse } from 'next/server';
import { questionService } from '../services/QuestionService';
import { getQuestionsQuerySchema } from '../validators/question.validator';

export class QuestionController {
  async getQuestions(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const parsed = getQuestionsQuerySchema.safeParse(queryObj);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid query parameters', errors: parsed.error.issues.map(e => e.message) },
        { status: 400 }
      );
    }

    const { page, limit, category, difficulty, tags, featured, sort, search } = parsed.data;

    const filters = { category, difficulty, tags, featured, search };
    const options = { page, limit, sort };

    const { questions, total } = await questionService.getQuestions(filters, options);

    return NextResponse.json({
      success: true,
      message: 'Questions fetched successfully',
      data: questions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrevious: page > 1,
      },
    });
  }

  async getQuestionBySlug(slug: string) {
    let question;
    if (/^\d+$/.test(slug)) {
      question = await questionService.getQuestionById(parseInt(slug, 10));
    } else {
      question = await questionService.getQuestionBySlug(slug);
    }

    if (!question) {
      return NextResponse.json(
        { success: false, message: 'Question not found', errors: ['Question matching identifier was not found'] },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Question fetched successfully',
      data: question,
    });
  }
}

export const questionController = new QuestionController();
