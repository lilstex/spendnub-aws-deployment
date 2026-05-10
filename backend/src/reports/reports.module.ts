import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from '../expense/schema/expense.schema';
import { Income, IncomeSchema } from '../income/schema/income.schema';
import { BudgetConfig, BudgetConfigSchema } from '../budget/schema/budget.schema';
import { ReportsController } from './controller/reports.controller';
import { ReportsService } from './service/reports.service';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Income.name, schema: IncomeSchema },
      { name: BudgetConfig.name, schema: BudgetConfigSchema },
    ]),
    SubscriptionModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
