import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from './schema/expense.schema';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { ExpenseController } from './controller/expense.controller';
import { ExpenseService } from './service/expense.service';
import { BudgetModule } from 'src/budget/budget.module';
import { InsightModule } from 'src/insight/insight.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
    SubscriptionModule,
    forwardRef(() => InsightModule),
    BudgetModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService],
  exports: [ExpenseService],
})
export class ExpenseModule {}
