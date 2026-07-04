import { User, IUser } from '../models/User';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  }
}

export const userRepository = new UserRepository();
