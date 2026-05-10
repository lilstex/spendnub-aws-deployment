import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SubscriptionPlan {
  PERSONAL = 'personal', // ₦1,500/month
  FAMILY = 'family', // ₦3,500/month
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  reference: string;

  @Prop({ required: true, enum: ['stripe', 'paystack'] })
  gateway: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: SubscriptionPlan, required: true })
  plan: SubscriptionPlan;

  @Prop({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  billingCycle: BillingCycle;

  @Prop({ default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Prop()
  expiresAt: Date;

  @Prop({ type: Object })
  metadata: any;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
