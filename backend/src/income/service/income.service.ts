import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Income } from '../schema/income.schema';
import { BudgetService } from 'src/budget/service/budget.service';
import { CreateIncomeDto } from '../dto/income.dto';
import { InsightService } from 'src/insight/service/insight.service';

@Injectable()
export class IncomeService {
  constructor(
    @InjectModel(Income.name) private incomeModel: Model<Income>,
    private budgetService: BudgetService,
    @Inject(forwardRef(() => InsightService))
    private insightService: InsightService,
  ) {}

  async createIncome(userId: string, dto: CreateIncomeDto) {
    const budget = await this.budgetService.getBudget(userId);

    // Only split across ACTIVE (unlocked) categories
    const activeCategories = budget.categories.filter(
      (cat: any) => !cat.isLocked,
    );

    if (activeCategories.length === 0) {
      throw new BadRequestException(
        'No active budget categories found. Please configure your budget first.',
      );
    }

    // Re-normalise percentages across active categories only so they sum to 100%
    const activeTotal = activeCategories.reduce(
      (sum: number, cat: any) => sum + cat.percentage,
      0,
    );

    const splits = activeCategories.map((cat: any) => ({
      categoryName: cat.name,
      // Scale percentage relative to active categories only
      allocatedAmount: parseFloat(
        ((cat.percentage / activeTotal) * dto.amount).toFixed(2),
      ),
    }));

    const newIncome = new this.incomeModel({
      userId,
      totalAmount: dto.amount,
      description: dto.description,
      splits,
    });

    await newIncome.save();

    // Update rolling balances for each active split only
    await Promise.all(
      newIncome.splits.map((split) =>
        this.insightService.updateBalance(
          userId,
          split.categoryName,
          split.allocatedAmount,
          'income',
          newIncome._id.toString(),
        ),
      ),
    );

    return newIncome;
  }

  async getLastMonthTotal(userId: string): Promise<number> {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const result = await this.incomeModel.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async getCurrentMonthTotal(userId: string): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const result = await this.incomeModel.aggregate([
      { $match: { userId, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return result.length > 0 ? result[0].total : 0;
  }

  async findLatest(userId: string, limit = 5) {
    return this.incomeModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.incomeModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0)
      throw new NotFoundException('Income not found');
    await this.insightService.reverseLedgerEntry(id.toString());
  }
}
