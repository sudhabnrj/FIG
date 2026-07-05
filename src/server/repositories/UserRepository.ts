import { User, IUser } from '../models/User';

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).exec();
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username }).exec();
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    return User.findOne({ verificationToken: token }).exec();
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return User.findOne({ resetPasswordToken: token }).exec();
  }

  async findByProvider(provider: 'google' | 'github', providerId: string): Promise<IUser | null> {
    return User.findOne({ provider, providerId }).exec();
  }

  async create(data: Partial<IUser>): Promise<IUser> {
    return User.create(data);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }
}

export const userRepository = new UserRepository();
