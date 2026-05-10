import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BillingCycle, SubscriptionPlan } from '../schema/subscription.schema';

export const PLAN_PRICING = {
  [SubscriptionPlan.PERSONAL]: {
    [BillingCycle.MONTHLY]: 1500,
    [BillingCycle.ANNUAL]: 15000,
  },
  [SubscriptionPlan.FAMILY]: {
    [BillingCycle.MONTHLY]: 3500,
    [BillingCycle.ANNUAL]: 36000,
  },
};

// Max buckets per plan
export const PLAN_BUCKET_LIMITS = {
  free: 4,
  personal: 999, // unlimited
  family: 999,
};

export class InitializeSubscriptionDto {
  @ApiProperty({ enum: ['stripe', 'paystack'] })
  @IsEnum(['stripe', 'paystack'])
  gateway: string;

  @ApiProperty({ enum: SubscriptionPlan })
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;

  @ApiProperty({ enum: BillingCycle, default: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}
