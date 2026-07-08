import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/server/middlewares/errorHandler';
import { withAuth, AuthenticatedNextRequest } from '@/server/middlewares/auth';
import { User } from '@/server/models/User';
import { Question } from '@/server/models/Question';
import { Review } from '@/server/models/Review';

export const GET = withErrorHandler(
  withAuth(async (request: AuthenticatedNextRequest) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'questions';
    
    let csvContent = '';
    let filename = `report-${type}-${Date.now()}.csv`;

    if (type === 'users') {
      const users = await User.find().select('name username email role status createdAt').exec();
      const headers = ['Name', 'Username', 'Email', 'Role', 'Status', 'Joined Date'];
      const rows = users.map((u) => [
        `"${u.name.replace(/"/g, '""')}"`,
        `"${u.username.replace(/"/g, '""')}"`,
        `"${u.email.replace(/"/g, '""')}"`,
        u.role,
        u.status,
        u.createdAt.toISOString(),
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else if (type === 'reviews') {
      const reviews = await Review.find().exec();
      const headers = ['Review ID', 'Entity Type', 'Entity ID', 'Status', 'History Length', 'Created At'];
      const rows = reviews.map((r) => [
        r._id.toString(),
        r.entityType,
        r.entityId.toString(),
        r.status,
        r.history.length.toString(),
        r.createdAt ? new Date(r.createdAt).toISOString() : '',
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const questions = await Question.find().populate('authorId', 'name').exec();
      const headers = ['Title', 'Category', 'Difficulty', 'Status', 'Is Published', 'Author', 'Created At'];
      const rows = questions.map((q) => [
        `"${(q.title || '').replace(/"/g, '""')}"`,
        `"${(q.category || '').replace(/"/g, '""')}"`,
        q.difficulty,
        q.status,
        q.isPublished ? 'Yes' : 'No',
        `"${(q.authorId as any)?.name ? (q.authorId as any).name.replace(/"/g, '""') : 'System'}"`,
        q.createdAt ? new Date(q.createdAt).toISOString() : '',
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }, ['moderator', 'admin', 'super_admin'])
);
