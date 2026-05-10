import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserPlan } from 'src/user/schema/user.schema';
import { SubscriptionService } from '../service/subscription.service';

@Injectable()
export class SubscriptionExpiryCron {
  private readonly logger = new Logger(SubscriptionExpiryCron.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private subscriptionService: SubscriptionService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSubscriptions() {
    this.logger.log('Subscription expiry check running...');
    const now = new Date();

    // Find users whose trial OR subscription has lapsed but aren't yet downgraded
    const expiredUsers = await this.userModel
      .find({
        $or: [
          // Trial expired and not yet processed
          {
            trialExpiration: { $lt: now },
            isSubscribed: false,
            plan: { $ne: UserPlan.FREE }, // still showing trial plan
          },
          // Paid subscription expired
          {
            isSubscribed: true,
            subscriptionExpiresAt: { $lt: now },
          },
        ],
      })
      .select('_id email')
      .lean();

    if (expiredUsers.length === 0) {
      this.logger.log('No expired accounts found.');
      return;
    }

    this.logger.log(`Processing ${expiredUsers.length} expired account(s)...`);

    for (const u of expiredUsers) {
      try {
        await this.subscriptionService.handleExpiredSubscription(
          u._id.toString(),
        );
        this.logger.log(`Processed expiry for ${u.email}`);
      } catch (err) {
        this.logger.error(`Failed for ${u._id}: ${(err as Error).message}`);
      }
    }
  }
}
