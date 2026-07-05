import { logger } from '../../lib/logger';

export class EmailService {
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3001'}/verify-email?token=${token}`;
    
    logger.info(`✉️ [Email Service] Verification link for ${email}:`);
    logger.info(`👉 ${verificationUrl}`);
    
    // Also output to standard console to ensure visibility in all shell setups
    console.log(`\n-----------------------------------------`);
    console.log(`✉️  [Email Service] Verification Link:`);
    console.log(`👉 ${verificationUrl}`);
    console.log(`-----------------------------------------\n`);
    
    return true;
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3001'}/reset-password?token=${token}`;
    
    logger.info(`✉️ [Email Service] Password Reset link for ${email}:`);
    logger.info(`👉 ${resetUrl}`);
    
    console.log(`\n-----------------------------------------`);
    console.log(`✉️  [Email Service] Password Reset Link:`);
    console.log(`👉 ${resetUrl}`);
    console.log(`-----------------------------------------\n`);
    
    return true;
  }
}

export const emailService = new EmailService();
