import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ConfigService } from '../config/config.service';
import { EmailService } from './services/email.service';
import { OtpUtils } from './utils/otp.utils';
import { EmailUtils } from './utils/email.utils';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleProfile } from './interfaces/google-profile.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';

import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = OtpUtils.generateOtp(6);
    const hashedOtp = await OtpUtils.hashOtp(otp);
    const otpExpiresAt = OtpUtils.getOtpExpiryTime(10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      emailVerificationOtp: hashedOtp,
      otpExpiresAt,
      isEmailVerified: false,
    });

    await user.save();

    this.eventEmitter.emit('user.registered', { email, firstName, otp });

    return {
      success: true,
      message: 'Registration successful. Check your email for OTP.',
      data: {
        email,
        message: 'Verification code sent. Valid for 10 minutes.',
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { email, otp } = verifyEmailDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!user.emailVerificationOtp) {
      throw new BadRequestException('No OTP found. Please register again.');
    }

    if (OtpUtils.isOtpExpired(user.otpExpiresAt)) {
      user.emailVerificationOtp = null;
      user.otpExpiresAt = null;
      await user.save();
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    const isOtpValid = await OtpUtils.verifyOtp(otp, user.emailVerificationOtp);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP. Please try again.');
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = null;
    user.otpExpiresAt = null;
    await user.save();

    this.eventEmitter.emit('user.verified', { email, firstName: user.firstName });

    return {
      success: true,
      message: 'Email verified successfully',
      data: {
        email,
        isEmailVerified: true,
      },
    };
  }

  private async generateTokens(user: UserDocument) {
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      { expiresIn: this.configService.jwtExpiration }
    );

    // Signed (not opaque random) so refresh() can identify the user straight from
    // the cookie without a separate userId param — still hashed at rest below,
    // same as before, so a leaked DB row alone can't be replayed as a refresh token.
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: this.configService.jwtRefreshExpiration },
    );
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    user.refreshToken = hashedRefreshToken;
    await user.save();

    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    if (user.lockedUntil && new Date() < user.lockedUntil) {
      throw new UnauthorizedException('Account is locked. Try again later.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      user.lastLoginAttempt = new Date();

      if (user.loginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        throw new UnauthorizedException('Too many failed attempts. Account locked for 15 minutes.');
      }

      await user.save();
      throw new UnauthorizedException('Invalid email or password');
    }

    user.loginAttempts = 0;
    user.lastLoginAttempt = new Date();
    user.lockedUntil = null;
    
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Access denied');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Access denied');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const isRefreshValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isRefreshValid) {
       throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.generateTokens(user);
    return {
      success: true,
      message: 'Tokens refreshed',
      data: tokens,
    }
  }

  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken: null });
    return {
      success: true,
      message: 'Logout successful',
      data: null,
    };
  }

  async googleLogin(profile: GoogleProfile) {
    const { email, displayName } = profile;
    const [firstName, ...lastNameParts] = displayName.split(' ');
    const lastName = lastNameParts.join(' ');

    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = new this.userModel({
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
        isEmailVerified: true,
        role: 'user',
      });
    } else if (!user.isEmailVerified) {
      user.isEmailVerified = true;
    }
    
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      success: true,
      message: 'Google login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    };
  }

  async validateUser(userId: string) {
    return this.userModel.findById(userId).select('-password -emailVerificationOtp -refreshToken -resetPasswordToken');
  }

  async resendOtp(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const otp = OtpUtils.generateOtp(6);
    const hashedOtp = await OtpUtils.hashOtp(otp);
    const otpExpiresAt = OtpUtils.getOtpExpiryTime(10);

    user.emailVerificationOtp = hashedOtp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    this.eventEmitter.emit('user.resend-otp', { email, firstName: user.firstName, otp });

    return {
      success: true,
      message: 'New OTP sent to your email',
      data: {
        email,
      },
    };
  }
  
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      return {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      };
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    
    this.eventEmitter.emit('user.forgot-password', { email, firstName: user.firstName, resetToken });
    
    return {
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    };
  }
  
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    
    const users = await this.userModel.find({
      resetPasswordExpiresAt: { $gt: new Date() }
    });
    
    let targetUser: UserDocument | null = null;
    for (const user of users) {
      if (user.resetPasswordToken && await bcrypt.compare(token, user.resetPasswordToken)) {
        targetUser = user;
        break;
      }
    }
    
    if (!targetUser) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
    
    targetUser.password = await bcrypt.hash(newPassword, 10);
    targetUser.resetPasswordToken = null;
    targetUser.resetPasswordExpiresAt = null;
    targetUser.lockedUntil = null;
    targetUser.loginAttempts = 0;
    
    await targetUser.save();
    
    return {
      success: true,
      message: 'Password has been reset successfully',
    }
  }
}
