import { NextResponse } from 'next/server';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { userRepository } from '../repositories/UserRepository';
import { userAdminUpdateSchema } from '../validators/dashboard.validator';
import { auditLogService } from '../services/AuditLogService';
import { User } from '../models/User';

export class UserController {
  async getUsers(request: AuthenticatedNextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const query: any = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await User.countDocuments(query).exec();

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  }

  async updateUser(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const body = await request.json();
    const validated = userAdminUpdateSchema.parse(body);

    const targetUser = await userRepository.findById(params.id);
    if (!targetUser) {
      return NextResponse.json({ success: false, errors: ['User not found'] }, { status: 404 });
    }

    if (targetUser.role === 'super_admin') {
      return NextResponse.json(
        { success: false, errors: ['Super Admin accounts cannot be suspended, blocked, deleted, or have their roles altered.'] },
        { status: 403 }
      );
    }

    const updated = await userRepository.update(params.id, validated);

    await auditLogService.logAction(
      request.user._id.toString(),
      'USER_ACCOUNT_UPDATED',
      { targetUserId: params.id, changes: validated },
      request
    );

    return NextResponse.json({ success: true, data: updated });
  }

  async resetUserPassword(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const body = await request.json();
    const { password } = body;
    if (!password || password.length < 8) {
      return NextResponse.json({ success: false, errors: ['Password must be at least 8 characters long'] }, { status: 400 });
    }

    const targetUser = await userRepository.findById(params.id);
    if (!targetUser) {
      return NextResponse.json({ success: false, errors: ['User not found'] }, { status: 404 });
    }

    if (targetUser.role === 'super_admin' && request.user.role !== 'super_admin') {
      return NextResponse.json({ success: false, errors: ['Only Super Admins can reset other Super Admin passwords'] }, { status: 403 });
    }

    targetUser.password = password;
    await targetUser.save();

    await auditLogService.logAction(
      request.user._id.toString(),
      'USER_PASSWORD_RESET',
      { targetUserId: params.id },
      request
    );

    return NextResponse.json({ success: true, message: 'Password reset successfully' });
  }

  async deleteUser(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const targetUser = await userRepository.findById(params.id);
    if (!targetUser) {
      return NextResponse.json({ success: false, errors: ['User not found'] }, { status: 404 });
    }

    if (targetUser.role === 'super_admin') {
      return NextResponse.json({ success: false, errors: ['Super Admin accounts cannot be deleted'] }, { status: 403 });
    }

    targetUser.status = 'deleted';
    await targetUser.save();

    await auditLogService.logAction(
      request.user._id.toString(),
      'USER_ACCOUNT_DELETED',
      { targetUserId: params.id },
      request
    );

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  }
}

export const userController = new UserController();
