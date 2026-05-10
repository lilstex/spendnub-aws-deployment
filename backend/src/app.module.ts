import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as Joi from 'joi';
import { UserModule } from './user/user.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { BudgetModule } from './budget/budget.module';
import { IncomeModule } from './income/income.module';
import { ExpenseModule } from './expense/expense.module';
import { InsightModule } from './insight/insight.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ExportModule } from './export/exports.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InvestmentModule } from './investment/investment.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        DATABASE_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        TOKEN_VALIDATION_DURATION: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): MongooseModuleOptions => {
        return {
          uri: configService.get<string>('DATABASE_URI'),
        };
      },
    }),
    UserModule,
    SubscriptionModule,
    BudgetModule,
    IncomeModule,
    ExpenseModule,
    InsightModule,
    DashboardModule,
    ExportModule,
    TransactionsModule,
    InvestmentModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
