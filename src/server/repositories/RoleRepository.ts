import { Role, IRole } from '../models/Role';

export class RoleRepository {
  async findById(id: string): Promise<IRole | null> {
    return Role.findById(id).exec();
  }

  async findByName(name: string): Promise<IRole | null> {
    return Role.findOne({ name }).exec();
  }

  async findAll(): Promise<IRole[]> {
    return Role.find().exec();
  }

  async create(data: Partial<IRole>): Promise<IRole> {
    return Role.create(data);
  }

  async update(id: string, data: Partial<IRole>): Promise<IRole | null> {
    return Role.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await Role.findByIdAndDelete(id).exec();
    return res !== null;
  }
}

export const roleRepository = new RoleRepository();
