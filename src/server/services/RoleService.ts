import { roleRepository } from '../repositories/RoleRepository';
import { permissionRepository } from '../repositories/PermissionRepository';
import { IRole } from '../models/Role';

const DEFAULT_ROLES = {
  user: [
    'questions:read',
    'questions:create',
    'questions:update_own',
    'questions:delete_own',
    'answers:create',
    'answers:update_own',
    'answers:delete_own',
    'drafts:manage',
    'bookmarks:manage',
    'notifications:read',
  ],
  moderator: [
    'questions:read',
    'questions:create',
    'questions:update_own',
    'questions:delete_own',
    'answers:create',
    'answers:update_own',
    'answers:delete_own',
    'drafts:manage',
    'bookmarks:manage',
    'notifications:read',
    'questions:review',
    'answers:review',
    'categories:manage',
    'tags:manage',
    'reports:read',
  ],
  admin: [
    'questions:read',
    'questions:create',
    'questions:update_own',
    'questions:delete_own',
    'answers:create',
    'answers:update_own',
    'answers:delete_own',
    'drafts:manage',
    'bookmarks:manage',
    'notifications:read',
    'questions:review',
    'answers:review',
    'categories:manage',
    'tags:manage',
    'reports:read',
    'users:read',
    'users:manage',
    'roles:manage',
    'permissions:manage',
    'media:manage',
    'analytics:read',
    'reports:manage',
    'settings:manage',
    'audit_logs:read',
  ],
  super_admin: [
    'questions:read',
    'questions:create',
    'questions:update_own',
    'questions:delete_own',
    'answers:create',
    'answers:update_own',
    'answers:delete_own',
    'drafts:manage',
    'bookmarks:manage',
    'notifications:read',
    'questions:review',
    'answers:review',
    'categories:manage',
    'tags:manage',
    'reports:read',
    'users:read',
    'users:manage',
    'roles:manage',
    'permissions:manage',
    'media:manage',
    'analytics:read',
    'reports:manage',
    'settings:manage',
    'audit_logs:read',
    'system:manage',
  ],
};

const ALL_PERMISSIONS = [
  { name: 'questions:read', description: 'View public and draft questions', module: 'questions' },
  { name: 'questions:create', description: 'Create new questions', module: 'questions' },
  { name: 'questions:update_own', description: 'Update own questions', module: 'questions' },
  { name: 'questions:delete_own', description: 'Delete own questions', module: 'questions' },
  { name: 'answers:create', description: 'Create answers', module: 'answers' },
  { name: 'answers:update_own', description: 'Update own answers', module: 'answers' },
  { name: 'answers:delete_own', description: 'Delete own answers', module: 'answers' },
  { name: 'drafts:manage', description: 'Manage own drafts', module: 'drafts' },
  { name: 'bookmarks:manage', description: 'Manage own bookmarks', module: 'bookmarks' },
  { name: 'notifications:read', description: 'Read own notifications', module: 'notifications' },
  { name: 'questions:review', description: 'Review questions in queue', module: 'reviews' },
  { name: 'answers:review', description: 'Review answers in queue', module: 'reviews' },
  { name: 'categories:manage', description: 'Create, update, merge categories', module: 'categories' },
  { name: 'tags:manage', description: 'Create, update, merge tags', module: 'tags' },
  { name: 'reports:read', description: 'Read system reports', module: 'reports' },
  { name: 'users:read', description: 'View user listings', module: 'users' },
  { name: 'users:manage', description: 'Suspend, activate, delete users', module: 'users' },
  { name: 'roles:manage', description: 'Modify roles and permissions mapping', module: 'roles' },
  { name: 'permissions:manage', description: 'Manage individual permissions', module: 'permissions' },
  { name: 'media:manage', description: 'Manage and clean media library', module: 'media' },
  { name: 'analytics:read', description: 'View dashboard analytics', module: 'analytics' },
  { name: 'reports:manage', description: 'Generate and export user/content reports', module: 'reports' },
  { name: 'settings:manage', description: 'Configure site details and SEO options', module: 'settings' },
  { name: 'audit_logs:read', description: 'View system audit logs', module: 'audit_logs' },
  { name: 'system:manage', description: 'Super admin access to all settings and configurations', module: 'system' },
];

export class RoleService {
  async seedIfNeeded(): Promise<void> {
    const roles = await roleRepository.findAll();
    if (roles.length === 0) {
      console.log('Seeding default permissions...');
      for (const perm of ALL_PERMISSIONS) {
        const existing = await permissionRepository.findByName(perm.name);
        if (!existing) {
          await permissionRepository.create(perm);
        }
      }

      console.log('Seeding default roles...');
      for (const [roleName, perms] of Object.entries(DEFAULT_ROLES)) {
        await roleRepository.create({
          name: roleName,
          description: `Default role for ${roleName}`,
          permissions: perms,
        });
      }
    }
  }

  async checkPermission(roleName: string, permissionName: string): Promise<boolean> {
    await this.seedIfNeeded();
    if (roleName === 'super_admin') return true;

    const role = await roleRepository.findByName(roleName);
    if (!role) return false;

    return role.permissions.includes(permissionName);
  }

  async getRolePermissions(roleName: string): Promise<string[]> {
    await this.seedIfNeeded();
    if (roleName === 'super_admin') {
      const allPerms = await permissionRepository.findAll();
      return allPerms.map((p) => p.name);
    }
    const role = await roleRepository.findByName(roleName);
    return role ? role.permissions : [];
  }
}

export const roleService = new RoleService();
