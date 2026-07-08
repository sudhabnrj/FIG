import { NextResponse } from 'next/server';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { roleRepository } from '../repositories/RoleRepository';
import { permissionRepository } from '../repositories/PermissionRepository';
import { roleValidator } from '../validators/dashboard.validator';
import { auditLogService } from '../services/AuditLogService';

export class RoleController {
  async getRoles(request: AuthenticatedNextRequest) {
    const roles = await roleRepository.findAll();
    return NextResponse.json({ success: true, data: roles });
  }

  async getRole(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const role = await roleRepository.findById(params.id);
    if (!role) {
      return NextResponse.json({ success: false, errors: ['Role not found'] }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: role });
  }

  async createRole(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const validated = roleValidator.parse(body);

    const existing = await roleRepository.findByName(validated.name);
    if (existing) {
      return NextResponse.json({ success: false, errors: ['Role with this name already exists'] }, { status: 400 });
    }

    const role = await roleRepository.create(validated);

    await auditLogService.logAction(
      request.user._id.toString(),
      'ROLE_CREATED',
      { roleName: validated.name },
      request
    );

    return NextResponse.json({ success: true, data: role }, { status: 201 });
  }

  async updateRole(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const body = await request.json();
    const validated = roleValidator.parse(body);

    const targetRole = await roleRepository.findById(params.id);
    if (!targetRole) {
      return NextResponse.json({ success: false, errors: ['Role not found'] }, { status: 404 });
    }

    if (targetRole.name === 'super_admin' || targetRole.name === 'admin' || targetRole.name === 'moderator' || targetRole.name === 'user') {
      if (validated.name !== targetRole.name) {
        return NextResponse.json({ success: false, errors: ['Core system role names cannot be modified.'] }, { status: 403 });
      }
    }

    const updated = await roleRepository.update(params.id, validated);

    await auditLogService.logAction(
      request.user._id.toString(),
      'ROLE_UPDATED',
      { roleId: params.id, roleName: validated.name },
      request
    );

    return NextResponse.json({ success: true, data: updated });
  }

  async deleteRole(request: AuthenticatedNextRequest, { params }: { params: { id: string } }) {
    const targetRole = await roleRepository.findById(params.id);
    if (!targetRole) {
      return NextResponse.json({ success: false, errors: ['Role not found'] }, { status: 404 });
    }

    const coreRoles = ['super_admin', 'admin', 'moderator', 'user', 'guest'];
    if (coreRoles.includes(targetRole.name)) {
      return NextResponse.json({ success: false, errors: ['Core system roles cannot be deleted.'] }, { status: 403 });
    }

    await roleRepository.delete(params.id);

    await auditLogService.logAction(
      request.user._id.toString(),
      'ROLE_DELETED',
      { roleId: params.id, roleName: targetRole.name },
      request
    );

    return NextResponse.json({ success: true, message: 'Role deleted successfully' });
  }

  async getPermissions(request: AuthenticatedNextRequest) {
    const permissions = await permissionRepository.findAll();
    return NextResponse.json({ success: true, data: permissions });
  }
}

export const roleController = new RoleController();
