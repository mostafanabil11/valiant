import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type SessionDocument = HydratedDocument<Session>;

// One entry per signed-in device/browser, so logging in on a phone doesn't
// silently invalidate a desktop session — each holds its own hashed refresh
// token that rotates independently on every /auth/refresh call.
@Schema({ _id: true, timestamps: false })
export class Session {
  _id!: Types.ObjectId;

  @Prop({ required: true })
  tokenHash: string = '';

  @Prop({ type: String, default: null })
  userAgent: string | null = null;

  @Prop({ type: String, default: null })
  ip: string | null = null;

  @Prop({ required: true })
  createdAt: Date = new Date();

  @Prop({ required: true })
  expiresAt: Date = new Date();
}

export const SessionSchema = SchemaFactory.createForClass(Session);

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
  googleId: string | null = null;

  @Prop({ default: 'local' })
  authProvider: 'local' | 'google' = 'local';

  @Prop({ type: [SessionSchema], default: [] })
  sessions: Session[] = [];

  @Prop({ type: String, default: null })
  resetPasswordToken: string | null = null;

  @Prop({ type: Date, default: null })
  resetPasswordExpiresAt: Date | null = null;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// resetPasswordToken stores a sha256 hash (not bcrypt — it's already 32 random
// bytes, so it needs no further slow-hashing) so resetPassword() can look the
// user up directly by token instead of bcrypt-comparing against every pending user.
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });

// sparse: local-auth users never get a googleId, so a plain unique index
// would collide on the many `null` values instead of ignoring them.
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
