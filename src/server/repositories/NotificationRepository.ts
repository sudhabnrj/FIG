import { Notification, INotification } from '../models/Notification';

export class NotificationRepository {
  async findById(id: string): Promise<INotification | null> {
    return Notification.findById(id).exec();
  }

  async findByUserId(userId: string, limit = 50, skip = 0): Promise<INotification[]> {
    return Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countUnread(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, read: false }).exec();
  }

  async countTotal(userId: string): Promise<number> {
    return Notification.countDocuments({ userId }).exec();
  }

  async create(data: Partial<INotification>): Promise<INotification> {
    return Notification.create(data);
  }

  async markAsRead(id: string): Promise<INotification | null> {
    return Notification.findByIdAndUpdate(id, { $set: { read: true } }, { new: true }).exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await Notification.findByIdAndDelete(id).exec();
    return res !== null;
  }

  async clearAll(userId: string): Promise<void> {
    await Notification.deleteMany({ userId }).exec();
  }
}

export const notificationRepository = new NotificationRepository();
