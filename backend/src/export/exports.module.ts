import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from 'src/expense/schema/expense.schema';
import { Income, IncomeSchema } from 'src/income/schema/income.schema';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { ExportController } from './controller/export.controller';
import { ExportService } from './service/export.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Expense.name, schema: ExpenseSchema },
      { name: Income.name, schema: IncomeSchema },
    ]),
    SubscriptionModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
