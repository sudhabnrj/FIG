import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';
import { Question } from '@/server/models/Question';
import { communityService } from '@/server/services/CommunityService';
import { questionValidator } from '@/server/validators/community.validator';
import { auditLogService } from '@/server/services/AuditLogService';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    const question = await Question.findById(params.id).exec();
    if (!question) {
      return NextResponse.json({ success: false, errors: ['Question not found'] }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: question });
  })
);

export const PUT = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest, { params }: { params: { id: string } }) => {
    const body = await request.json();
    const validated = questionValidator.parse(body);

    const question = await Question.findById(params.id).exec();
    if (!question) {
      return NextResponse.json({ success: false, errors: ['Question not found'] }, { status: 404 });
    }

    if (question.authorId.toString() !== request.user._id.toString() && request.user.role !== 'admin' && request.user.role !== 'super_admin') {
      return NextResponse.json({ success: false, errors: ['Permission denied'] }, { status: 403 });
    }

    const updated = await communityService.updateQuestion(params.id, validated, request.user._id.toString());

    await auditLogService.logAction(
      request.user._id.toString(),
      'QUESTION_MODIFIED',
      { questionId: params.id },
      request
    );

    return NextResponse.json({ success: true, data: updated });
  })
);
