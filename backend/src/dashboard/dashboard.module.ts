import { Module } from '@nestjs/common';
import { IncomeModule } from '../income/income.module';
import { ExpenseModule } from '../expense/expense.module';
import { InsightModule } from '../insight/insight.module';
import { UserModule } from '../user/user.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { DashboardController } from './controller/dashboard.controller';
import { DashboardService } from './service/dashboard.service';
import { BudgetModule } from 'src/budget/budget.module';

@Module({
  imports: [
    IncomeModule,
    ExpenseModule,
    InsightModule,
    UserModule,
    SubscriptionModule,
    BudgetModule,
    SubscriptionModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
