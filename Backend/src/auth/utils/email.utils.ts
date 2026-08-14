export class EmailUtils {
  static generateOtpEmailTemplate(userName: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; color: #333; margin-bottom: 20px; }
            .content { color: #666; line-height: 1.6; }
            .otp-box { background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .warning { color: #e74c3c; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Thank you for signing up! To complete your registration, please verify your email address using the code below:</p>

              <div class="otp-box">
                <p>Your verification code:</p>
                <div class="otp-code">${otp}</div>
              </div>

              <p>This code will expire in 10 minutes.</p>
              <p class="warning">⚠️ If you didn't request this code, please ignore this email.</p>

              <p>Best regards,<br><strong>Valiant Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Valiant. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateWelcomeEmailTemplate(userName: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; color: #333; margin-bottom: 20px; }
            .content { color: #666; line-height: 1.6; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Valiant! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>Your email has been verified successfully. Your account is now active and ready to use!</p>
              <p>You can now log in to your account and start shopping for your favorite clothing items.</p>
              <p>If you have any questions or need assistance, feel free to contact our support team.</p>
              <p>Happy shopping!<br><strong>Valiant Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Valiant. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generatePasswordResetEmailTemplate(userName: string, resetToken: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { text-align: center; color: #333; margin-bottom: 20px; }
            .content { color: #666; line-height: 1.6; }
            .token-box { background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0; word-break: break-all; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            .warning { color: #e74c3c; font-size: 12px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${userName},</p>
              <p>We received a request to reset your password. Use the token below to reset it:</p>

              <div class="token-box">
                <strong>${resetToken}</strong>
              </div>

              <p>This token will expire in 1 hour.</p>
              <p class="warning">⚠️ If you didn't request a password reset, please ignore this email.</p>

              <p>Best regards,<br><strong>Valiant Team</strong></p>
            </div>
            <div class="footer">
              <p>&copy; 2024 Valiant. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
