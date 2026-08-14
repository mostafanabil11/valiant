import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EmailService } from '../services/email.service';
import { EmailUtils } from '../utils/email.utils';

@Injectable()
export class AuthListener {
  constructor(private emailService: EmailService) {}

  @OnEvent('user.registered')
  async handleUserRegisteredEvent(payload: { email: string; firstName: string; otp: string }) {
    const emailTemplate = EmailUtils.generateOtpEmailTemplate(payload.firstName, payload.otp);
    await this.emailService.sendOtpEmail(payload.email, payload.firstName, payload.otp, emailTemplate);
  }

  @OnEvent('user.verified')
  async handleUserVerifiedEvent(payload: { email: string; firstName: string }) {
    const emailTemplate = EmailUtils.generateWelcomeEmailTemplate(payload.firstName);
    await this.emailService.sendWelcomeEmail(payload.email, payload.firstName, emailTemplate);
  }

  @OnEvent('user.resend-otp')
  async handleUserResendOtpEvent(payload: { email: string; firstName: string; otp: string }) {
    const emailTemplate = EmailUtils.generateOtpEmailTemplate(payload.firstName, payload.otp);
    await this.emailService.sendOtpEmail(payload.email, payload.firstName, payload.otp, emailTemplate);
  }

  @OnEvent('user.forgot-password')
  async handleUserForgotPasswordEvent(payload: { email: string; firstName: string; resetToken: string }) {
    const emailTemplate = EmailUtils.generatePasswordResetEmailTemplate(payload.firstName, payload.resetToken);
    await this.emailService.sendPasswordResetEmail(payload.email, payload.firstName, emailTemplate);
  }
}
