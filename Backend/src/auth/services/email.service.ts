import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@/config/config.service';

@Injectable()
export class EmailService {
  private transporter!: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // For development - using Gmail (you can change to other email providers)
    // In production, use environment variables for email credentials
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your_email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your_app_password',
      },
    });

    // For testing - log to console
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
      console.log('⚠️  Email service configured in development mode (console logging)');
    }
  }

  async sendOtpEmail(email: string, userName: string, otp: string, htmlTemplate: string): Promise<boolean> {
    try {
      // In development without email credentials, just log to console
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`
        📧 OTP Email (Development Mode)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        To: ${email}
        Subject: Email Verification - OTP
        OTP: ${otp}
        Expires in: 10 minutes
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
        return true;
      }

      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: 'Email Verification - OTP',
        html: htmlTemplate,
      });

      console.log(`✓ OTP email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email: string, userName: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`
        📧 Welcome Email (Development Mode)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        To: ${email}
        Subject: Welcome to Valiant
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
        return true;
      }

      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: 'Welcome to Valiant',
        html: htmlTemplate,
      });

      console.log(`✓ Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendPasswordResetEmail(email: string, userName: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`
        📧 Password Reset Email (Development Mode)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        To: ${email}
        Subject: Password Reset Request
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
        return true;
      }

      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: 'Password Reset Request',
        html: htmlTemplate,
      });

      console.log(`✓ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
