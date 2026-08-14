import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string = '';

  @Prop({ required: true })
  password: string = '';

  @Prop({ required: true })
  firstName: string = '';

  @Prop({ required: true })
  lastName: string = '';

  @Prop({ default: false })
  isEmailVerified: boolean = false;

  @Prop({ type: String, default: null })
  emailVerificationOtp: string | null = null;

  @Prop({ type: Date, default: null })
  otpExpiresAt: Date | null = null;

  @Prop({ default: 0 })
  loginAttempts: number = 0;

  @Prop({ type: Date, default: null })
  lastLoginAttempt: Date | null = null;

  @Prop({ type: Date, default: null })
  lockedUntil: Date | null = null;

  @Prop({ default: true })
  isActive: boolean = true;

  @Prop({ default: 'user' })
  role: string = 'user';

  @Prop({ type: String, default: null })
  refreshToken: string | null = null;

  @Prop({ type: String, default: null })
  resetPasswordToken: string | null = null;

  @Prop({ type: Date, default: null })
  resetPasswordExpiresAt: Date | null = null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
