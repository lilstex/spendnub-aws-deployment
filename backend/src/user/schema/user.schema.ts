import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserPlan {
  FREE = 'free',
  PERSONAL = 'personal',
  FAMILY = 'family',
  TRIAL = 'trial',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ required: true, minlength: 5, select: false })
  password: string;

  @Prop({ default: false })
  isSubscribed: boolean;

  @Prop({ enum: UserPlan, default: UserPlan.FREE })
  plan: UserPlan;

  // When their paid subscription expires (null = free/trial)
  @Prop({ default: null })
  subscriptionExpiresAt: Date;

  @Prop({ default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) })
  trialExpiration: Date;

  @Prop({ select: false })
  otp: number;

  @Prop({ select: false })
  otpExpiresAt: Date;

  @Prop({ select: false })
  passwordResetToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
