import { Module } from '@nestjs/common';
import { SubscriptionService } from './service/subscription.service';
import { PaystackService } from './service/paystack.service';
import { StripeService } from './service/stripe.service';
import { SubscriptionController } from './controller/subscription.controller';
import { Subscription, SubscriptionSchema } from './schema/subscription.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schema/user.schema';
import {
  BudgetConfig,
  BudgetConfigSchema,
} from 'src/budget/schema/budget.schema';
import { Expense, ExpenseSchema } from 'src/expense/schema/expense.schema';
import { Income, IncomeSchema } from 'src/income/schema/income.schema';
import { SubscriptionExpiryCron } from './cron/subscription-expiry.cron';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: User.name, schema: UserSchema },
      { name: BudgetConfig.name, schema: BudgetConfigSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Income.name, schema: IncomeSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [
    SubscriptionExpiryCron,
    SubscriptionService,
    PaystackService,
    StripeService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
