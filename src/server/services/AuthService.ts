import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/UserRepository';
import { IUser } from '../models/User';
import { env } from '../config/env';

export class AuthService {
  async register(username: string, email: string, password: string): Promise<IUser> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new Error('Email address is already registered');
    }

    return userRepository.create({
      username,
      email,
      password,
      role: 'user',
    });
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, username: user.username },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, token };
  }

  async verifyToken(token: string): Promise<IUser | null> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
      if (!decoded || !decoded.userId) return null;
      return userRepository.findById(decoded.userId);
    } catch (e) {
      return null;
    }
  }
}

export const authService = new AuthService();
