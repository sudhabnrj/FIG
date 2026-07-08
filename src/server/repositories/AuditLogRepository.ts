import { AuditLog, IAuditLog } from '../models/AuditLog';

export class AuditLogRepository {
  async findById(id: string): Promise<IAuditLog | null> {
    return AuditLog.findById(id).populate('userId', 'name username').exec();
  }

  async findLogs(query: any, limit = 50, skip = 0): Promise<IAuditLog[]> {
    return AuditLog.find(query)
      .populate('userId', 'name username')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async countLogs(query: any): Promise<number> {
    return AuditLog.countDocuments(query).exec();
  }

  async create(data: Partial<IAuditLog>): Promise<IAuditLog> {
    return AuditLog.create(data);
  }
}

export const auditLogRepository = new AuditLogRepository();
