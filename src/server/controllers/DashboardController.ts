import { NextResponse } from 'next/server';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { analyticsService } from '../services/AnalyticsService';
import { auditLogService } from '../services/AuditLogService';

export class DashboardController {
  async getMetrics(request: AuthenticatedNextRequest) {
    const user = request.user;
    if (user.role === 'admin' || user.role === 'super_admin') {
      const adminStats = await analyticsService.getAdminDashboardMetrics();
      return NextResponse.json({ success: true, data: adminStats });
    } else if (user.role === 'moderator') {
      const moderatorStats = await analyticsService.getModeratorDashboardMetrics();
      return NextResponse.json({ success: true, data: moderatorStats });
    } else {
      const userStats = await analyticsService.getUserDashboardMetrics(user._id.toString());
      return NextResponse.json({ success: true, data: userStats });
    }
  }

  async getAuditLogs(request: AuthenticatedNextRequest) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const action = searchParams.get('action');
    const userId = searchParams.get('userId');

    const query: any = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const result = await auditLogService.getLogs(query, limit, skip);
    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      },
    });
  }
}

export const dashboardController = new DashboardController();
