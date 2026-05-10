import { Injectable } from '@nestjs/common';
import { ExpenseService } from 'src/expense/service/expense.service';
import { IncomeService } from 'src/income/service/income.service';
import { InsightService } from 'src/insight/service/insight.service';
import { DashboardResponseDto } from '../dto/dashboard.dto';
import { BudgetService } from 'src/budget/service/budget.service';
import { SubscriptionService } from 'src/subscription/service/subscription.service';

@Injectable()
export class DashboardService {
  constructor(
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private insightService: InsightService,
    private budgetService: BudgetService,
    private subscriptionService: SubscriptionService,
  ) {}

  async getDashboardData(userId: string): Promise<DashboardResponseDto> {
    // Fetch everything in parallel — getAccessStatus never throws
    const [
      totalIncome,
      totalExpenses,
      categoryBalances,
      latestExpenses,
      budgetConfig,
      latestIncomes,
      accessStatus,
    ] = await Promise.all([
      this.incomeService.getCurrentMonthTotal(userId),
      this.expenseService.getMonthlyTotal(userId),
      this.insightService.getCategoryBalances(userId),
      this.expenseService.findLatest(userId, 5),
      this.budgetService.getBudget(userId),
      this.incomeService.findLatest(userId, 5),
      this.subscriptionService.getAccessStatus(userId), // ← added
    ]);

    // Map Buckets — carry isLocked flag through from budget config
    const buckets = budgetConfig.categories.map((configCat: any) => {
      const balanceData = categoryBalances.find(
        (ledger) => ledger.category === configCat.name,
      );

      const allocated = (totalIncome || 0) * (configCat.percentage / 100);

      return {
        _id: configCat._id.toString(),
        name: configCat.name,
        percentage: configCat.percentage,
        allocated: parseFloat(allocated.toFixed(2)),
        spent: parseFloat((balanceData?.spentThisMonth || 0).toFixed(2)),
        remaining: parseFloat((balanceData?.rollingBalance || 0).toFixed(2)),
        isLocked: configCat.isLocked ?? false, // ← added
      };
    });

    const lockedCount = buckets.filter((b) => b.isLocked).length;
    const upgradeRequired =
      accessStatus.isExpired ||
      (!accessStatus.isSubscribed && !accessStatus.isTrial);

    // Recent Transactions
    const recentTransactions = [
      ...latestExpenses.map((e) => {
        const expenseObj = e.toObject();
        return {
          ...expenseObj,
          _id: expenseObj._id.toString(),
          type: 'expense' as const,
          totalAmount: expenseObj.amount,
          categoryName: budgetConfig.categories.find(
            (c: any) => c._id.toString() === e.category?.toString(),
          )?.name,
        };
      }),
      ...latestIncomes.map((i) => {
        const incomeObj = i.toObject();
        return {
          ...incomeObj,
          _id: incomeObj._id.toString(),
          type: 'income' as const,
        };
      }),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 8);

    return {
      totalBalance: categoryBalances.reduce(
        (acc, cat) => acc + cat.rollingBalance,
        0,
      ),
      totalIncome,
      totalExpenses,
      buckets,
      recentTransactions,
      upgradeRequired, // ← added
      lockedCount, // ← added
      isExpired: accessStatus.isExpired, // ← added
    };
  }
}
