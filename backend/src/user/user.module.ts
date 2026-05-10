import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/security/middleware/jwt.strategy';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { ExpenseModule } from 'src/expense/expense.module';
import { InvestmentModule } from 'src/investment/investment.module';
import { EmailModule } from 'src/providers/email/email.module';
import { Expense, ExpenseSchema } from 'src/expense/schema/expense.schema';
import { Income, IncomeSchema } from 'src/income/schema/income.schema';
import {
  BudgetConfig,
  BudgetConfigSchema,
} from 'src/budget/schema/budget.schema';
import {
  CategoryLedger,
  CategoryLedgerSchema,
} from 'src/insight/schema/category-ledger.schema';
import {
  Subscription,
  SubscriptionSchema,
} from 'src/subscription/schema/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Income.name, schema: IncomeSchema },
      { name: BudgetConfig.name, schema: BudgetConfigSchema },
      { name: CategoryLedger.name, schema: CategoryLedgerSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<number>('TOKEN_VALIDATION_DURATION'),
          },
        };
      },
    }),
    ExpenseModule,
    InvestmentModule,
    EmailModule,
  ],
  controllers: [UserController],
  providers: [JwtStrategy, UserService],
  exports: [UserService, JwtStrategy, MongooseModule],
})
export class UserModule {}
