import { NextResponse } from 'next/server';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { notificationService } from '../services/NotificationService';

export class NotificationController {
  async getNotifications(request: AuthenticatedNextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const userId = request.user._id.toString();

    const result = await notificationService.getNotifications(userId, limit, skip);

    return NextResponse.json({
      success: true,
      data: result.notifications,
      unread: result.unread,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      },
    });
  }

  async markAsRead(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const updated = await notificationService.markRead(params.id);
    return NextResponse.json({ success: true, data: updated });
  }

  async markAllAsRead(request: AuthenticatedNextRequest) {
    const userId = request.user._id.toString();
    await notificationService.markAllRead(userId);
    return NextResponse.json({ success: true, message: 'All notifications marked as read' });
  }

  async deleteNotification(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const deleted = await notificationService.delete(params.id);
    return NextResponse.json({ success: deleted });
  }

  async clearAll(request: AuthenticatedNextRequest) {
    const userId = request.user._id.toString();
    await notificationService.clearAll(userId);
    return NextResponse.json({ success: true, message: 'All notifications cleared' });
  }
}

export const notificationController = new NotificationController();
