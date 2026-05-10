import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from 'src/expense/schema/expense.schema';
import { Income } from 'src/income/schema/income.schema';
import { SubscriptionService } from 'src/subscription/service/subscription.service';

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    private subscriptionService: SubscriptionService,
  ) {}

  async exportCSV(userId: string): Promise<string> {
    // ── Gate: Personal / Family only. Trial also gets access. ───────────────
    const status = await this.subscriptionService.getAccessStatus(userId);
    if (!status.isSubscribed && !status.isTrial) {
      throw new ForbiddenException(
        'CSV export is available on Personal and Family plans.',
      );
    }

    const [expenses, incomes] = await Promise.all([
      this.expenseModel
        .find({ userId: userId })
        .sort({ date: -1 })
        .lean()
        .exec(),
      this.incomeModel
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
    ]);

    // ── CSV helpers ──────────────────────────────────────────────────────────
    // Wrap value in quotes if it contains commas, quotes, or newlines
    const esc = (val: unknown): string => {
      if (val === undefined || val === null) return '';
      const s = String(val);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const isoDate = (d: unknown): string => {
      try {
        return new Date(d as string).toISOString().split('T')[0];
      } catch {
        return '';
      }
    };

    // ── Build rows ───────────────────────────────────────────────────────────
    const header = [
      'Date',
      'Type',
      'Description',
      'Category',
      'Subcategory',
      'Amount (NGN)',
      'Reference',
    ].join(',');

    const expenseRows: string[] = expenses.map((e) =>
      [
        isoDate(e.date),
        'expense',
        esc(e.description),
        esc(e.category),
        esc((e as any).subCategory ?? ''),
        (e as any).amount ?? 0,
        esc(e._id.toString()),
      ].join(','),
    );

    const incomeRows: string[] = incomes.flatMap((i) => {
      // Primary income row
      const main = [
        isoDate(i.date),
        'income',
        esc((i as any).description),
        'Income',
        '',
        (i as any).totalAmount ?? 0,
        esc(i._id.toString()),
      ].join(',');

      // One split row per bucket allocation so accountants can reconcile
      const splits: string[] = ((i as any).splits ?? []).map((s: any) =>
        [
          isoDate(i.date),
          'income_split',
          esc(`Split → ${s.categoryName}`),
          esc(s.categoryName),
          '',
          s.allocatedAmount ?? 0,
          esc(i._id.toString()),
        ].join(','),
      );

      return [main, ...splits];
    });

    // ── Assemble final CSV ───────────────────────────────────────────────────
    // Lines starting with # are treated as comments by Excel/Google Sheets
    const lines = [
      '# SpendNub Export',
      `# Generated : ${new Date().toISOString()}`,
      `# Plan      : ${status.plan}`,
      `# Records   : ${expenses.length} expenses · ${incomes.length} income entries`,
      '#',
      header,
      ...expenseRows,
      ...incomeRows,
    ];

    return lines.join('\n');
  }
}
