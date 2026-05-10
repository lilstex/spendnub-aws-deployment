import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BudgetConfig, BudgetConfigSchema } from './schema/budget.schema';
import { BudgetController } from './controller/budget.controller';
import { BudgetService } from './service/budget.service';
import { SubscriptionModule } from 'src/subscription/subscription.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BudgetConfig.name, schema: BudgetConfigSchema },
    ]),
    SubscriptionModule,
  ],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}
