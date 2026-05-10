import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Expense } from '../schema/expense.schema';
import { CreateExpenseDto } from '../dto/expense.dto';
import { BudgetService } from 'src/budget/service/budget.service';
import { InsightService } from 'src/insight/service/insight.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
    private budgetService: BudgetService,
    @Inject(forwardRef(() => InsightService))
    private insightService: InsightService,
  ) {}

  async create(userId: string, dto: CreateExpenseDto): Promise<Expense> {
    // Fetch user budget to resolve the category name from the ID
    const budget = await this.budgetService.getBudget(userId);
    const categoryMatch = budget.categories.find(
      (cat: any) => cat._id.toString() === dto.category,
    );

    if (!categoryMatch) {
      throw new BadRequestException('Invalid budget category selected.');
    }

    // Create the expense with the resolved category name
    const newExpense = new this.expenseModel({
      ...dto,
      userId,
      category: categoryMatch.name,
    });

    const savedExpense = await newExpense.save();

    // Subtract the amount from the Category Pulse
    await this.insightService.updateBalance(
      userId,
      categoryMatch.name,
      dto.amount,
      'expense',
      savedExpense._id.toString(),
    );

    return savedExpense;
  }

  async findAllByUser(userId: string): Promise<Expense[]> {
    return this.expenseModel.find({ userId }).sort({ date: -1 }).exec();
  }

  async getMonthlyTotal(userId: string, category?: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const filter: any = {
      userId,
      date: { $gte: startOfMonth },
    };

    if (category) filter.category = category;

    const result = await this.expenseModel.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await this.expenseModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0)
      throw new NotFoundException('Expense not found');

    await this.insightService.reverseLedgerEntry(id.toString());
  }

  async findLatest(userId: string, limit: number): Promise<Expense[]> {
    return this.expenseModel
      .find({ userId })
      .sort({ date: -1 }) // Sort by most recent first
      .limit(limit)
      .select('amount description category subCategory date')
      .exec();
  }
}
