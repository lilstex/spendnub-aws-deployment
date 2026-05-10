import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CategoryLedger } from '../schema/category-ledger.schema';
import { ExpenseService } from 'src/expense/service/expense.service';
import { BudgetService } from 'src/budget/service/budget.service';
import { IncomeService } from 'src/income/service/income.service';
import { User } from 'src/user/schema/user.schema';
import { SubscriptionService } from 'src/subscription/service/subscription.service';
import { Expense } from 'src/expense/schema/expense.schema';
import { BudgetConfig } from 'src/budget/schema/budget.schema';
import { Income } from 'src/income/schema/income.schema';

@Injectable()
export class InsightService {
  private readonly logger = new Logger(InsightService.name);
  constructor(
    @InjectModel(CategoryLedger.name)
    private ledgerModel: Model<CategoryLedger>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @Inject(forwardRef(() => ExpenseService))
    private expenseService: ExpenseService,
    private budgetService: BudgetService,
    @Inject(forwardRef(() => IncomeService))
    private incomeService: IncomeService,
    private subscriptionService: SubscriptionService,
    @InjectModel(Expense.name)
    private expenseModel: Model<Expense>,
    @InjectModel(BudgetConfig.name)
    private budgetModel: Model<BudgetConfig>,
    @InjectModel(Income.name)
    private incomeModel: Model<Income>,
  ) {}

  async getForecasting(userId: string) {
    const budget = await this.budgetService.getBudget(userId);
    const now = new Date();
    const daysPassed = now.getDate();
    const totalDays = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    const insights = await Promise.all(
      budget.categories.map(async (cat) => {
        const spent = await this.expenseService.getMonthlyTotal(
          userId,
          cat.name,
        );
        const projected = (spent / daysPassed) * totalDays;

        // We assume MonthlyBudgetAmount is fetched/calculated here based on latest Income
        // For this example, let's focus on the Burn Rate logic
        const isExceeding =
          projected > /* MonthlyBudgetAmount for Category */ 1000;

        const ledger = await this.ledgerModel.findOne({
          userId,
          categoryName: cat.name,
        });

        return {
          category: cat.name,
          currentMonthSpent: spent,
          projectedMonthEnd: projected.toFixed(2),
          isExceedingThreshold: isExceeding,
          rollingBalance: ledger?.rollingBalance || 0,
          insight: isExceeding
            ? `Warning: You are spending on ${cat.name} faster than planned.`
            : `Good job! Your ${cat.name} spending is within limits.`,
        };
      }),
    );

    return insights;
  }

  async getCategoryBalances(userId: string) {
    const [budget, currentMonthIncome, ledgers, accessStatus] =
      await Promise.all([
        this.budgetService.getBudget(userId),
        this.incomeService.getCurrentMonthTotal(userId),
        this.ledgerModel.find({ userId: userId }).exec(),
        this.subscriptionService.getAccessStatus(userId),
      ]);

    const hasSinkingFund = accessStatus.isSubscribed || accessStatus.isTrial;

    return budget.categories.map((cat: any) => {
      const ledger = ledgers.find((l) => l.categoryName === cat.name);
      const monthlyAllocation =
        (cat.percentage / 100) * (currentMonthIncome || 0);
      const spentThisMonth = ledger?.currentMonthSpent || 0;
      const monthlyRemaining = Math.max(0, monthlyAllocation - spentThisMonth);

      // Free users: remaining = this month's allocation minus this month's spend only
      // Paid users: remaining = actual rolling balance (accumulates across months)
      const rollingBalance = ledger?.rollingBalance || 0;

      return {
        category: cat.name,
        percentage: cat.percentage,
        monthlyAllocation,
        spentThisMonth,
        monthlyRemaining,
        rollingBalance: hasSinkingFund ? rollingBalance : monthlyRemaining,
        totalAvailable: hasSinkingFund ? rollingBalance : monthlyRemaining,
        sinkingFundEnabled: hasSinkingFund, // frontend uses this to show/hide the feature label
      };
    });
  }

  async rollOverMonth(
    userId: string,
    categoryName: string,
    monthlyAllocation: number,
  ) {
    const spent = await this.expenseService.getMonthlyTotal(
      userId,
      categoryName,
    );
    const remainder = monthlyAllocation - spent;

    if (remainder > 0) {
      await this.ledgerModel.findOneAndUpdate(
        { userId, categoryName },
        { $inc: { rollingBalance: remainder } },
        { upsert: true },
      );
    }
  }

  // Inside InsightService
  async updateBalance(
    userId: string,
    categoryName: string,
    amount: number,
    type: 'income' | 'expense',
    transactionId?: string,
  ) {
    const adjustment = type === 'income' ? amount : -amount;

    return this.ledgerModel.findOneAndUpdate(
      { userId, categoryName },
      {
        $inc: {
          rollingBalance: adjustment,
          totalReceived: type === 'income' ? amount : 0,
          currentMonthSpent: type === 'expense' ? amount : 0,
        },
        $set: {
          transactionId: transactionId ?? null,
        },
      },
      { upsert: true, new: true },
    );
  }

  async reverseLedgerEntry(transactionId: string) {
    return this.ledgerModel.deleteMany({ transactionId });
  }

  async getEnhancedForecasting(userId: string) {
    const uid = new Types.ObjectId(userId);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const currentExpenses = await this.expenseModel.find({
      userId: uid,
      date: { $gte: monthStart, $lte: now },
    }).exec();

    const budget = await this.budgetModel.findOne({ userId: uid }).exec();

    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const pastIncomes = await this.incomeModel.find({
      userId: uid,
      date: { $gte: threeMonthsAgo, $lt: monthStart },
    }).exec();

    const avgMonthlyIncome =
      pastIncomes.length > 0
        ? pastIncomes.reduce((s: number, i: any) => s + i.totalAmount, 0) / pastIncomes.length
        : 0;

    const categoryProjections: {
      name: string;
      budgetedAmount: number;
      spentSoFar: number;
      projectedMonthEnd: number;
      projectedVariance: number;
      onPaceToOvershoot: boolean;
    }[] = [];

    if (budget) {
      for (const cat of budget.categories) {
        const spentSoFar = currentExpenses
          .filter((e: any) => e.category?.toLowerCase() === cat.name?.toLowerCase())
          .reduce((s: number, e: any) => s + e.amount, 0);

        const dailyRate = dayOfMonth > 0 ? spentSoFar / dayOfMonth : 0;
        const projectedMonthEnd = dailyRate * daysInMonth;
        const budgetedAmount = avgMonthlyIncome * (cat.percentage / 100);
        const projectedVariance = budgetedAmount - projectedMonthEnd;

        categoryProjections.push({
          name: cat.name,
          budgetedAmount: Math.round(budgetedAmount * 100) / 100,
          spentSoFar: Math.round(spentSoFar * 100) / 100,
          projectedMonthEnd: Math.round(projectedMonthEnd * 100) / 100,
          projectedVariance: Math.round(projectedVariance * 100) / 100,
          onPaceToOvershoot: projectedMonthEnd > budgetedAmount,
        });
      }
    }

    const currentMonthSpend = currentExpenses.reduce((s: number, e: any) => s + e.amount, 0);
    const projectedTotalSpend = dayOfMonth > 0 ? (currentMonthSpend / dayOfMonth) * daysInMonth : 0;
    const projectedSavings = avgMonthlyIncome - projectedTotalSpend;
    const projectedSavingsRate =
      avgMonthlyIncome > 0 ? (projectedSavings / avgMonthlyIncome) * 100 : 0;

    return {
      avgMonthlyIncome: Math.round(avgMonthlyIncome * 100) / 100,
      projectedTotalSpend: Math.round(projectedTotalSpend * 100) / 100,
      projectedSavings: Math.round(projectedSavings * 100) / 100,
      projectedSavingsRate: Math.round(projectedSavingsRate * 100) / 100,
      daysElapsed: dayOfMonth,
      daysInMonth,
      categoryProjections,
      recommendations: categoryProjections
        .filter((c) => c.onPaceToOvershoot)
        .map((c) => ({
          category: c.name,
          message: `${c.name} is on pace to exceed budget by ₦${Math.abs(c.projectedVariance).toLocaleString()}`,
        })),
    };
  }

  // This cron runs at 00:00 on the 1st day of every month
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleMonthEndRollover() {
    this.logger.log('Starting Month-End Rollover Process...');

    // Fetch all users
    const users = await this.userModel.find({ isSubscribed: true });

    for (const user of users) {
      try {
        const budget = await this.budgetService.getBudget(user.id);
        const lastMonthIncome = await this.incomeService.getLastMonthTotal(
          user.id,
        );

        for (const cat of budget.categories) {
          const monthlyAllocation = (cat.percentage / 100) * lastMonthIncome;
          const actualSpent = await this.expenseService.getMonthlyTotal(
            user.id,
            cat.name,
          );

          const remainder = monthlyAllocation - actualSpent;

          if (remainder > 0) {
            await this.ledgerModel.findOneAndUpdate(
              { userId: user.id, categoryName: cat.name },
              { $inc: { rollingBalance: remainder } },
              { upsert: true },
            );
            this.logger.debug(
              `Rolled over ${remainder} for User ${user.id} in ${cat.name}`,
            );
          }
        }
      } catch (err) {
        this.logger.error(
          `Failed rollover for user ${user.id}: ${err.message}`,
        );
      }
    }
    this.logger.log('Month-End Rollover Process Completed.');
  }
}
