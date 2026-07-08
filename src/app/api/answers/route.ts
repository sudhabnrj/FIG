import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';
import { Answer } from '@/server/models/Answer';
import { auditLogService } from '@/server/services/AuditLogService';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    if (request.user.role === 'user') {
      query.authorId = request.user._id;
    }

    const items = await Answer.find(query)
      .populate('authorId', 'name username')
      .populate('questionId', 'title question')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await Answer.countDocuments(query).exec();

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  }, ['user', 'moderator', 'admin', 'super_admin'])
);

export const DELETE = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    const body = await request.json();
    const { ids } = body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, errors: ['An array of IDs is required'] }, { status: 400 });
    }

    await Answer.deleteMany({ _id: { $in: ids } }).exec();

    await auditLogService.logAction(
      request.user._id.toString(),
      'ANSWERS_BULK_DELETED',
      { count: ids.length },
      request
    );

    return NextResponse.json({ success: true, message: 'Answers deleted successfully' });
  }, ['admin', 'super_admin'])
);

export const PATCH = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    const body = await request.json();
    const { ids, status } = body;
    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json({ success: false, errors: ['ids (array) and status (string) are required'] }, { status: 400 });
    }

    await Answer.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    ).exec();

    await auditLogService.logAction(
      request.user._id.toString(),
      'ANSWERS_BULK_STATUS_UPDATED',
      { count: ids.length, newStatus: status },
      request
    );

    return NextResponse.json({ success: true, message: `Answers status updated to ${status}` });
  }, ['moderator', 'admin', 'super_admin'])
);
