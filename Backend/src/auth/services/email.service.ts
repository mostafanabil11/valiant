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

  async sendOrderConfirmationEmail(email: string, userName: string, orderNumber: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`
        📧 Order Confirmation Email (Development Mode)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        To: ${email}
        Subject: Order Confirmed — ${orderNumber}
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `);
        return true;
      }

      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: `Order Confirmed — ${orderNumber}`,
        html: htmlTemplate,
      });

      console.log(`✓ Order confirmation email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      // Never fail checkout because the confirmation email couldn't send —
      // the order is already placed and paid for (or COD-committed); losing
      // the email is a much smaller problem than losing the order.
      return false;
    }
  }

  async sendOrderShippedEmail(email: string, orderNumber: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`📧 Order Shipped Email (Development Mode) — To: ${email}, Order: ${orderNumber}`);
        return true;
      }
      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: `Your Order Has Shipped — ${orderNumber}`,
        html: htmlTemplate,
      });
      console.log(`✓ Shipped email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending shipped email:', error);
      return false;
    }
  }

  async sendOrderDeliveredEmail(email: string, orderNumber: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`📧 Order Delivered Email (Development Mode) — To: ${email}, Order: ${orderNumber}`);
        return true;
      }
      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: `Delivered — ${orderNumber}`,
        html: htmlTemplate,
      });
      console.log(`✓ Delivered email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending delivered email:', error);
      return false;
    }
  }

  async sendOrderRefundedEmail(email: string, orderNumber: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`📧 Order Refunded Email (Development Mode) — To: ${email}, Order: ${orderNumber}`);
        return true;
      }
      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: `Refund Processed — ${orderNumber}`,
        html: htmlTemplate,
      });
      console.log(`✓ Refund email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending refund email:', error);
      return false;
    }
  }

  async sendOrderCancelledEmail(email: string, orderNumber: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`📧 Order Cancelled Email (Development Mode) — To: ${email}, Order: ${orderNumber}`);
        return true;
      }
      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: `Order Cancelled — ${orderNumber}`,
        html: htmlTemplate,
      });
      console.log(`✓ Cancellation email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      return false;
    }
  }

  async sendBackInStockEmail(email: string, productName: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`📧 Back In Stock Email (Development Mode) — To: ${email}, Product: ${productName}`);
        return true;
      }
      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: `Back in Stock — ${productName}`,
        html: htmlTemplate,
      });
      console.log(`✓ Back-in-stock email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending back-in-stock email:', error);
      return false;
    }
  }

  async sendAbandonedCartEmail(email: string, htmlTemplate: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`📧 Abandoned Cart Email (Development Mode) — To: ${email}`);
        return true;
      }
      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER') || 'noreply@valiant.com'}>`,
        to: email,
        subject: 'You left something in your bag',
        html: htmlTemplate,
      });
      console.log(`✓ Abandoned cart email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('Error sending abandoned cart email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, userName: string, htmlTemplate: string, resetUrl?: string): Promise<boolean> {
    try {
      if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
        console.log(`
        📧 Password Reset Email (Development Mode)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        To: ${email}
        Subject: Password Reset Request
        Reset link: ${resetUrl ?? '(not provided)'}
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
