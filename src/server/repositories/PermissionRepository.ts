import { Permission, IPermission } from '../models/Permission';

export class PermissionRepository {
  async findById(id: string): Promise<IPermission | null> {
    return Permission.findById(id).exec();
  }

  async findByName(name: string): Promise<IPermission | null> {
    return Permission.findOne({ name }).exec();
  }

  async findAll(): Promise<IPermission[]> {
    return Permission.find().exec();
  }

  async create(data: Partial<IPermission>): Promise<IPermission> {
    return Permission.create(data);
  }

  async delete(id: string): Promise<boolean> {
    const res = await Permission.findByIdAndDelete(id).exec();
    return res !== null;
  }
}

export const permissionRepository = new PermissionRepository();
