import { auditLogRepository } from '../repositories/AuditLogRepository';
import { IAuditLog } from '../models/AuditLog';

export class AuditLogService {
  async logAction(
    userId: string | undefined,
    action: string,
    details: Record<string, any>,
    req: Request | null
  ): Promise<IAuditLog> {
    let ip = '127.0.0.1';
    let userAgent = 'Unknown';
    let device = 'Unknown';

    if (req) {
      ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      userAgent = req.headers.get('user-agent') || 'Unknown';
      
      if (/mobile/i.test(userAgent)) {
        device = 'Mobile';
      } else if (/tablet/i.test(userAgent)) {
        device = 'Tablet';
      } else {
        device = 'Desktop';
      }
    }

    return auditLogRepository.create({
      userId,
      action,
      details,
      ip,
      userAgent,
      device,
      timestamp: new Date(),
    });
  }

  async getLogs(query: any, limit = 50, skip = 0): Promise<{ logs: IAuditLog[]; total: number }> {
    const logs = await auditLogRepository.findLogs(query, limit, skip);
    const total = await auditLogRepository.countLogs(query);
    return { logs, total };
  }
}

export const auditLogService = new AuditLogService();
