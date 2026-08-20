import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@/config/config.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    if (this.configService.isEmailConfigured) {
      this.transporter = nodemailer.createTransport({
        // Spelled out rather than service:'gmail' so the port is visible: some
        // hosts block outbound SMTP, and knowing which port we tried is the
        // difference between a diagnosable failure and a mystery.
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          // Google prints App Passwords in four blocks for readability; the
          // spaces are presentation, not part of the secret. A value pasted
          // from that screen — or from a dashboard field that kept a stray
          // space — must still authenticate.
          user: this.configService.get<string>('EMAIL_USER')?.trim(),
          pass: this.configService.get<string>('EMAIL_PASSWORD')?.replace(/\s+/g, ''),
        },
        // Without these nodemailer waits minutes on a blocked port, so a
        // failure surfaces long after the request that caused it.
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      // Proves at startup whether mail can actually leave this host, instead
      // of finding out when a customer's confirmation silently doesn't arrive.
      // Deliberately not awaited: email is not worth delaying boot for.
      void this.transporter
        .verify()
        .then(() => this.logger.log('SMTP connection verified — order emails will be delivered'))
        .catch((err: Error) =>
          this.logger.error(
            `SMTP verification FAILED — no email will be delivered. Reason: ${err.message}`,
          ),
        );
      return;
    }

    // Previously this fell back to the literal strings 'your_email@gmail.com'
    // and 'your_app_password', so an unconfigured deployment authenticated
    // against Gmail with placeholder credentials, failed, and swallowed the
    // error — orders were confirmed on screen and no email ever arrived, with
    // nothing in the logs saying why.
    //
    // jsonTransport delivers nowhere and cannot fail, which keeps checkout
    // working; the warning below is what makes the missing configuration
    // visible instead of silent.
    this.transporter = nodemailer.createTransport({ jsonTransport: true });
    this.logger.warn(
      'EMAIL_USER / EMAIL_PASSWORD are not set — order confirmations, OTPs and password resets will NOT be delivered.',
    );
  }

  /** True when messages actually leave the building. */
  get isConfigured(): boolean {
    return this.configService.isEmailConfigured;
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
    if (!this.isConfigured) {
      this.logger.warn(`Order ${orderNumber}: no email credentials, confirmation to ${email} not sent`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: `"Valiant" <${this.configService.get<string>('EMAIL_USER')?.trim()}>`,
        to: email,
        subject: `Order Confirmed — ${orderNumber}`,
        html: htmlTemplate,
      });

      this.logger.log(`Order ${orderNumber}: confirmation email sent to ${email}`);
      return true;
    } catch (error) {
      // Logged at error level with the order number attached, so a missing
      // confirmation can be traced to the order it belonged to rather than
      // being an anonymous line in the output.
      this.logger.error(
        `Order ${orderNumber}: confirmation email to ${email} FAILED — ${(error as Error).message}`,
      );
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
