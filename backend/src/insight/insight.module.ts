import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpenseModule } from '../expense/expense.module';
import { BudgetModule } from '../budget/budget.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import {
  CategoryLedger,
  CategoryLedgerSchema,
} from './schema/category-ledger.schema';
import { InsightController } from './controller/insight.controller';
import { InsightService } from './service/insight.service';
import { ScheduleModule } from '@nestjs/schedule';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { IncomeModule } from 'src/income/income.module';
import { Expense, ExpenseSchema } from 'src/expense/schema/expense.schema';
import { BudgetConfig, BudgetConfigSchema } from 'src/budget/schema/budget.schema';
import { Income, IncomeSchema } from 'src/income/schema/income.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: CategoryLedger.name, schema: CategoryLedgerSchema },
      { name: User.name, schema: UserSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: BudgetConfig.name, schema: BudgetConfigSchema },
      { name: Income.name, schema: IncomeSchema },
    ]),
    forwardRef(() => ExpenseModule),
    BudgetModule,
    SubscriptionModule,
    forwardRef(() => IncomeModule),
  ],
  controllers: [InsightController],
  providers: [InsightService],
  exports: [InsightService],
})
export class InsightModule {}
