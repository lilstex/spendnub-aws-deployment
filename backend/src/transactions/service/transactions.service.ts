import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from 'src/expense/schema/expense.schema';
import { Income } from 'src/income/schema/income.schema';
import { SubscriptionService } from 'src/subscription/service/subscription.service';

interface HistoryQuery {
  page: number;
  limit: number;
  type?: 'income' | 'expense';
  from?: string;
  to?: string;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    private subscriptionService: SubscriptionService,
  ) {}

  async getHistory(userId: string, query: HistoryQuery) {
    const status = await this.subscriptionService.getAccessStatus(userId);

    // Free (non-trial) users: hard 30-day lookback
    const isLimited = !status.isSubscribed && !status.isTrial;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const buildDateFilter = (dateField: string) => {
      const filter: Record<string, Date> = {};
      const floor = isLimited ? thirtyDaysAgo : null;

      if (floor) filter['$gte'] = floor;
      if (query.from) {
        const fromDate = new Date(query.from);
        filter['$gte'] = floor && fromDate < floor ? floor : fromDate;
      }
      if (query.to) filter['$lte'] = new Date(query.to + 'T23:59:59.999Z');

      return Object.keys(filter).length > 0 ? { [dateField]: filter } : {};
    };

    const expenseFilter = { userId: userId, ...buildDateFilter('date') };
    const incomeFilter = { userId: userId, ...buildDateFilter('createdAt') };

    const [allExpenses, allIncomes] = await Promise.all([
      query.type !== 'income'
        ? this.expenseModel.find(expenseFilter).sort({ date: -1 }).lean().exec()
        : Promise.resolve([]),
      query.type !== 'expense'
        ? this.incomeModel
            .find(incomeFilter)
            .sort({ createdAt: -1 })
            .lean()
            .exec()
        : Promise.resolve([]),
    ]);

    const merged = [
      ...allExpenses.map((e) => ({
        ...e,
        type: 'expense',
        _sortDate: e.date ?? e.createdAt,
      })),
      ...allIncomes.map((i) => ({
        ...i,
        type: 'income',
        _sortDate: i.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(b._sortDate as string).getTime() -
        new Date(a._sortDate as string).getTime(),
    );

    const total = merged.length;
    const pages = Math.max(1, Math.ceil(total / query.limit));
    const start = (query.page - 1) * query.limit;

    return {
      transactions: merged.slice(start, start + query.limit),
      total,
      page: query.page,
      pages,
      limit: query.limit,
      isLimited,
      limitNote: isLimited ? 'Free plan shows the last 30 days only' : null,
    };
  }
}
