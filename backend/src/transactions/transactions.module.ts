import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from 'src/expense/schema/expense.schema';
import { Income, IncomeSchema } from 'src/income/schema/income.schema';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { TransactionsController } from './controller/transactions.controller';
import { TransactionsService } from './service/transactions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Income.name, schema: IncomeSchema },
    ]),
    SubscriptionModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
