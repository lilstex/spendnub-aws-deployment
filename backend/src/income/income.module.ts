import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Income, IncomeSchema } from './schema/income.schema';
import { BudgetModule } from 'src/budget/budget.module';
import { IncomeController } from './controller/income.controller';
import { IncomeService } from './service/income.service';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { InsightModule } from 'src/insight/insight.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Income.name, schema: IncomeSchema }]),
    BudgetModule,
    SubscriptionModule,
    forwardRef(() => InsightModule),
  ],
  controllers: [IncomeController],
  providers: [IncomeService],
  exports: [IncomeService],
})
export class IncomeModule {}
