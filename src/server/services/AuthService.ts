import crypto from 'crypto';
import { userRepository } from '../repositories/UserRepository';
import { IUser } from '../models/User';
import { env } from '../config/env';
import { signJwt, verifyJwt } from '../../lib/auth/jwt';
import { emailService } from './EmailService';

function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_]/.test(password);
  return hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

function validateUsername(username: string): boolean {
  if (username.length < 3 || username.length > 30) return false;
  return /^[a-zA-Z0-9_]+$/.test(username);
}

export class AuthService {
  async register(name: string, username: string, email: string, password: string): Promise<IUser> {
    if (!name || name.trim() === '') {
      throw new Error('Name is required');
    }
    
    if (!validateUsername(username)) {
      throw new Error('Username must be 3-30 characters and contain only letters, numbers, or underscores');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existingEmail = await userRepository.findByEmail(trimmedEmail);
    if (existingEmail) {
      throw new Error('Email address is already registered');
    }

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await userRepository.create({
      name,
      username,
      email: trimmedEmail,
      password,
      provider: 'local',
      role: 'user',
      status: 'pending_verification',
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await emailService.sendVerificationEmail(trimmedEmail, verificationToken);

    return user;
  }

  async verifyEmail(token: string): Promise<IUser> {
    if (!token) {
      throw new Error('Verification token is required');
    }

    const user = await userRepository.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      throw new Error('Verification link has expired');
    }

    user.isVerified = true;
    user.status = 'active';
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return user;
  }

  async login(email: string, password: string): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(trimmedEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.provider !== 'local') {
      throw new Error(`Please log in using your connected account: ${user.provider}`);
    }

    if (user.status === 'pending_verification') {
      throw new Error('Account email verification is pending. Please verify your email first.');
    }

    if (user.status === 'suspended' || user.status === 'blocked') {
      throw new Error(`Your account has been ${user.status}. Please contact support.`);
    }

    if (user.status === 'deleted') {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const accessToken = await signJwt(
      { userId: user._id, role: user.role, username: user.username, email: user.email },
      env.JWT_SECRET,
      15 * 60 // 15 mins
    );

    const refreshToken = await signJwt(
      { userId: user._id },
      env.JWT_REFRESH_SECRET,
      30 * 24 * 60 * 60 // 30 days
    );

    user.lastLogin = new Date();
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!token) {
      throw new Error('Refresh token is required');
    }

    const decoded = await verifyJwt(token, env.JWT_REFRESH_SECRET);
    if (!decoded || !decoded.userId) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.status !== 'active') {
      throw new Error('Account status is invalid');
    }

    const accessToken = await signJwt(
      { userId: user._id, role: user.role, username: user.username, email: user.email },
      env.JWT_SECRET,
      15 * 60 // 15 mins
    );

    const refreshToken = await signJwt(
      { userId: user._id },
      env.JWT_REFRESH_SECRET,
      30 * 24 * 60 * 60 // 30 days
    );

    return { accessToken, refreshToken };
  }

  async forgotPassword(email: string): Promise<boolean> {
    const trimmedEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(trimmedEmail);
    // Return success to prevent email enumeration attacks
    if (!user) {
      return true;
    }

    if (user.provider !== 'local') {
      // Do not allow password reset for OAuth accounts
      return true;
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpires = resetPasswordTokenExpires;
    await user.save();

    await emailService.sendPasswordResetEmail(trimmedEmail, resetPasswordToken);

    return true;
  }

  async resetPassword(token: string, password: string): Promise<boolean> {
    if (!token) {
      throw new Error('Reset token is required');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (user.resetPasswordTokenExpires && user.resetPasswordTokenExpires < new Date()) {
      throw new Error('Reset link has expired');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    await user.save();

    return true;
  }

  async handleOAuthLogin(
    provider: 'google' | 'github',
    profile: { id: string; name: string; email: string; avatar?: string }
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const email = profile.email.toLowerCase();
    
    // Check if user already connected with this provider/providerId
    let user = await userRepository.findByProvider(provider, profile.id);
    
    if (!user) {
      // Check if email already registered (account linking)
      user = await userRepository.findByEmail(email);
      
      if (user) {
        // Link account
        user.provider = provider;
        user.providerId = profile.id;
        user.isVerified = true;
        user.status = 'active';
        if (profile.avatar && !user.avatar) {
          user.avatar = profile.avatar;
        }
        await user.save();
      } else {
        // Create new OAuth user
        // Generate random username based on email/name
        let username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
        if (username.length < 3) username = `user_${Math.floor(100 + Math.random() * 900)}`;
        
        // Ensure username unique
        let usernameExists = await userRepository.findByUsername(username);
        let counter = 1;
        while (usernameExists) {
          username = `${username.substring(0, 25)}_${counter}`;
          usernameExists = await userRepository.findByUsername(username);
          counter++;
        }

        user = await userRepository.create({
          name: profile.name || username,
          username,
          email,
          provider,
          providerId: profile.id,
          avatar: profile.avatar,
          role: 'user',
          status: 'active',
          isVerified: true,
        });
      }
    }

    if (user.status === 'suspended' || user.status === 'blocked') {
      throw new Error(`Your account has been ${user.status}. Please contact support.`);
    }

    const accessToken = await signJwt(
      { userId: user._id, role: user.role, username: user.username, email: user.email },
      env.JWT_SECRET,
      15 * 60
    );

    const refreshToken = await signJwt(
      { userId: user._id },
      env.JWT_REFRESH_SECRET,
      30 * 24 * 60 * 60
    );

    user.lastLogin = new Date();
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async verifyAccessToken(token: string): Promise<IUser | null> {
    try {
      const decoded = await verifyJwt(token, env.JWT_SECRET);
      if (!decoded || !decoded.userId) return null;
      return userRepository.findById(decoded.userId);
    } catch (e) {
      return null;
    }
  }
}

export const authService = new AuthService();
