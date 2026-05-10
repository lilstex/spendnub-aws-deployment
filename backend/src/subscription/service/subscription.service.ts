/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserPlan } from 'src/user/schema/user.schema';
import {
  Subscription,
  SubscriptionStatus,
  SubscriptionPlan,
  BillingCycle,
} from '../schema/subscription.schema';
import { BudgetConfig, BudgetCategory } from 'src/budget/schema/budget.schema';
import { PaystackService } from './paystack.service';
import {
  InitializeSubscriptionDto,
  PLAN_PRICING,
  PLAN_BUCKET_LIMITS,
} from '../dto/subscription.dto';
import { Income } from 'src/income/schema/income.schema';
import { Expense } from 'src/expense/schema/expense.schema';

const FREE_BUCKET_LIMIT = 4;

export interface AccessStatus {
  hasAccess: boolean;
  plan: string;
  isSubscribed: boolean;
  isTrial: boolean;
  isExpired: boolean;
  trialExpiration: Date | null;
  subscriptionExpiresAt: Date | null;
  bucketLimit: number;
  daysRemaining: number | null;
}

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) private subModel: Model<Subscription>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(BudgetConfig.name) private budgetModel: Model<BudgetConfig>,
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    private paystack: PaystackService,
  ) {}

  async getAccessStatus(userId: string): Promise<AccessStatus> {
    const user = await this.userModel.findById(userId);
    const now = new Date();

    const isTrial = !user.isSubscribed && now < user.trialExpiration;
    const isSubscribed = user.isSubscribed;

    // Check if paid subscription has expired
    if (
      isSubscribed &&
      user.subscriptionExpiresAt &&
      now > user.subscriptionExpiresAt
    ) {
      // Downgrade them — subscription lapsed
      await this.handleExpiredSubscription(userId);
      return this.buildExpiredStatus(user);
    }

    if (isSubscribed) {
      const daysRemaining = user.subscriptionExpiresAt
        ? Math.ceil(
            (user.subscriptionExpiresAt.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

      return {
        hasAccess: true,
        plan: user.plan,
        isSubscribed: true,
        isTrial: false,
        isExpired: false,
        trialExpiration: null,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        bucketLimit: PLAN_BUCKET_LIMITS[user.plan] ?? 4,
        daysRemaining,
      };
    }

    if (isTrial) {
      const daysRemaining = Math.ceil(
        (user.trialExpiration.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return {
        hasAccess: true,
        plan: 'trial',
        isSubscribed: false,
        isTrial: true,
        isExpired: false,
        trialExpiration: user.trialExpiration,
        subscriptionExpiresAt: null,
        // Trial gets Personal-level access as per your 90-day trial promise
        bucketLimit: PLAN_BUCKET_LIMITS['personal'],
        daysRemaining,
      };
    }

    // Fully expired — no trial, no subscription
    return this.buildExpiredStatus(user);
  }

  async checkAccess(userId: string): Promise<boolean> {
    const status = await this.getAccessStatus(userId);
    if (!status.hasAccess) {
      throw new ForbiddenException(
        'Your trial has expired. Subscribe to continue.',
      );
    }
    return true;
  }

  async getBucketLimit(userId: string): Promise<number> {
    const status = await this.getAccessStatus(userId);
    return status.bucketLimit;
  }

  async initiate(
    userId: string,
    email: string,
    dto: InitializeSubscriptionDto,
  ) {
    const amount = PLAN_PRICING[dto.plan][dto.billingCycle];

    if (!amount) {
      throw new BadRequestException('Invalid plan or billing cycle');
    }

    if (dto.gateway === 'paystack') {
      const data = await this.paystack.initializeTransaction(
        userId,
        email,
        amount,
        dto.plan,
        dto.billingCycle,
      );
      await this.subModel.create({
        user: userId,
        reference: data.reference,
        gateway: 'paystack',
        amount,
        plan: dto.plan,
        billingCycle: dto.billingCycle,
        status: SubscriptionStatus.PENDING,
      });
      return { url: data.authorization_url, reference: data.reference };
    } else {
      throw new BadRequestException('Invalid payment gateway');
    }
  }

  async finalizeSubscription(
    userId: string,
    reference: string,
    status: SubscriptionStatus,
    plan?: SubscriptionPlan,
    billingCycle?: BillingCycle,
  ) {
    // Check if already activated to handle page refresh / double-click
    const existing = await this.subModel.findOne({
      reference,
      status: SubscriptionStatus.ACTIVE,
    });
    if (existing) {
      return {
        message: 'Already active',
        plan: plan ?? SubscriptionPlan.PERSONAL,
        billingCycle: billingCycle ?? BillingCycle.MONTHLY,
        expiresAt: existing.expiresAt?.toISOString() ?? '',
        alreadyActive: true,
      };
    }

    if (!plan || !billingCycle) {
      const pending = await this.subModel.findOne({
        reference,
        status: SubscriptionStatus.PENDING,
      });
      plan = pending?.plan ?? SubscriptionPlan.PERSONAL;
      billingCycle = pending?.billingCycle ?? BillingCycle.MONTHLY;
    }

    const expiresAt =
      billingCycle === BillingCycle.ANNUAL
        ? new Date(Date.now() + 366 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

    await Promise.all([
      this.userModel.findByIdAndUpdate(userId, {
        isSubscribed: true,
        plan,
        subscriptionExpiresAt: expiresAt,
      }),
      this.subModel.findOneAndUpdate(
        { reference },
        { status: SubscriptionStatus.ACTIVE, plan, billingCycle, expiresAt },
        { upsert: true },
      ),
    ]);

    await this.unlockAllBuckets(userId);

    return {
      message: 'Subscription activated',
      plan,
      billingCycle,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async handleExpiredSubscription(userId: string) {
    await this.userModel.findByIdAndUpdate(
      userId,
      {
        isSubscribed: false,
        plan: UserPlan.FREE,
        subscriptionExpiresAt: null,
      },
      { new: true },
    );

    // Soft-lock excess buckets
    await this.softLockExcessBuckets(userId);
  }

  async getHistory(userId: string, query: any) {
    const { plan } = await this.getAccessStatus(userId);

    // Free/expired users: hard cap at 30 days back
    const isFreeTier = plan === UserPlan.FREE || plan === UserPlan.TRIAL; // trial gets full access
    const isTrial = plan === UserPlan.TRIAL;

    let dateFloor: Date | null = null;
    if (isFreeTier && !isTrial) {
      dateFloor = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const filter: any = { userId: userId };
    if (dateFloor) filter.date = { $gte: dateFloor };
    if (query.from)
      filter.date = { ...filter.date, $gte: new Date(query.from) };
    if (query.to) filter.date = { ...filter.date, $lte: new Date(query.to) };

    const [expenses, incomes] = await Promise.all([
      query.type !== 'income'
        ? this.expenseModel.find(filter).sort({ date: -1 })
        : [],
      query.type !== 'expense'
        ? this.incomeModel.find(filter).sort({ createdAt: -1 })
        : [],
    ]);

    // Merge, sort, paginate
    const all = [
      ...expenses.map((e) => ({ ...e.toObject(), type: 'expense' })),
      ...incomes.map((i) => ({ ...i.toObject(), type: 'income' })),
    ].sort(
      (a, b) =>
        new Date(b.date ?? b.createdAt).getTime() -
        new Date(a.date ?? a.createdAt).getTime(),
    );

    const start = (query.page - 1) * query.limit;
    return {
      transactions: all.slice(start, start + query.limit),
      total: all.length,
      page: query.page,
      isLimited: isFreeTier && !isTrial, // tells frontend to show upgrade nudge
      limitNote: isFreeTier && !isTrial ? 'Free plan shows 30 days only' : null,
    };
  }

  private async softLockExcessBuckets(userId: string): Promise<void> {
    const budget = await this.budgetModel.findOne({
      userId: userId,
    });

    if (!budget || budget.categories.length <= FREE_BUCKET_LIMIT) return;

    // Mutate subdocuments in place using Mongoose DocumentArray
    budget.categories.forEach((cat: BudgetCategory, index: number) => {
      cat.isLocked = index >= FREE_BUCKET_LIMIT;
    });

    await budget.save();
  }

  private async unlockAllBuckets(userId: string): Promise<void> {
    const budget = await this.budgetModel.findOne({
      userId: userId,
    });

    if (!budget) return;

    // Check if anything is actually locked first (avoid pointless save)
    const hasLocked = budget.categories.some(
      (cat: BudgetCategory) => cat.isLocked,
    );
    if (!hasLocked) return;

    budget.categories.forEach((cat: BudgetCategory) => {
      cat.isLocked = false;
    });

    await budget.save();
  }

  private buildExpiredStatus(user: any): AccessStatus {
    return {
      hasAccess: false,
      plan: UserPlan.FREE,
      isSubscribed: false,
      isTrial: false,
      isExpired: true,
      trialExpiration: user.trialExpiration,
      subscriptionExpiresAt: null,
      bucketLimit: PLAN_BUCKET_LIMITS[UserPlan.FREE],
      daysRemaining: 0,
    };
  }
}
