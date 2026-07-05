import nodemailer from 'nodemailer';
import { logger } from '../../lib/logger';

export class EmailService {
  private getTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '2525', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3001'}/verify-email?token=${token}`;
    
    logger.info(`✉️ [Email Service] Verification link for ${email}:`);
    logger.info(`👉 ${verificationUrl}`);
    
    // Also output to standard console to ensure visibility in all shell setups
    console.log(`\n-----------------------------------------`);
    console.log(`✉️  [Email Service] Verification Link:`);
    console.log(`👉 ${verificationUrl}`);
    console.log(`-----------------------------------------\n`);

    const transporter = this.getTransporter();
    if (transporter) {
      try {
        const from = process.env.EMAIL_FROM || 'noreply@example.com';
        await transporter.sendMail({
          from,
          to: email,
          subject: 'Verify Your Email - Interview Preparation Guide',
          text: `Welcome to the Interview Preparation Guide! Please verify your email by clicking the link: ${verificationUrl}`,
          html: `<p>Welcome to the Interview Preparation Guide!</p><p>Please verify your email by clicking the link below:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
        });
        logger.info(`✉️ [Email Service] Email sent successfully to ${email}`);
      } catch (err) {
        logger.error(`❌ [Email Service] Failed to send verification email to ${email}:`, err);
      }
    }
    
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

    const transporter = this.getTransporter();
    if (transporter) {
      try {
        const from = process.env.EMAIL_FROM || 'noreply@example.com';
        await transporter.sendMail({
          from,
          to: email,
          subject: 'Reset Your Password - Interview Preparation Guide',
          text: `You requested a password reset. Please click the link to reset your password: ${resetUrl}`,
          html: `<p>You requested a password reset.</p><p>Please click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });
        logger.info(`✉️ [Email Service] Password reset email sent successfully to ${email}`);
      } catch (err) {
        logger.error(`❌ [Email Service] Failed to send password reset email to ${email}:`, err);
      }
    }
    
    return true;
  }
}

export const emailService = new EmailService();

