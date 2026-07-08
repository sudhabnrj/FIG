import { notificationRepository } from '../repositories/NotificationRepository';
import { INotification } from '../models/Notification';

export class NotificationService {
  async notify(
    userId: string,
    type: 'approval' | 'rejection' | 'needs_revision' | 'security' | 'system',
    title: string,
    message: string,
    link?: string
  ): Promise<INotification> {
    return notificationRepository.create({
      userId,
      type,
      title,
      message,
      link,
      read: false,
    });
  }

  async getNotifications(userId: string, limit = 50, skip = 0): Promise<{ notifications: INotification[]; total: number; unread: number }> {
    const notifications = await notificationRepository.findByUserId(userId, limit, skip);
    const total = await notificationRepository.countTotal(userId);
    const unread = await notificationRepository.countUnread(userId);
    return { notifications, total, unread };
  }

  async markRead(id: string): Promise<INotification | null> {
    return notificationRepository.markAsRead(id);
  }

  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllAsRead(userId);
  }

  async delete(id: string): Promise<boolean> {
    return notificationRepository.delete(id);
  }

  async clearAll(userId: string): Promise<void> {
    await notificationRepository.clearAll(userId);
  }
}

export const notificationService = new NotificationService();
