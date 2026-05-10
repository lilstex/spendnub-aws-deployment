import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

export interface CategoryReport {
  name: string;
  budgetedPercent: number;
  budgetedAmount: number;
  actualSpent: number;
  variance: number;
  utilisationPercent: number;
  status: 'over' | 'on_track' | 'under_utilised' | 'unused';
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  categories: CategoryReport[];
  overBudget: string[];
  underUtilised: string[];
  unused: string[];
  prevMonth: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
  } | null;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel('Expense') private expenseModel: Model<any>,
    @InjectModel('Income') private incomeModel: Model<any>,
    @InjectModel('BudgetConfig') private budgetModel: Model<any>,
  ) {}

  async getMonthlyReport(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyReport> {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const [incomes, expenses, budget] = await Promise.all([
      this.incomeModel
        .find({ userId: userId, date: { $gte: start, $lt: end } })
        .exec(),
      this.expenseModel
        .find({ userId: userId, date: { $gte: start, $lt: end } })
        .exec(),
      this.budgetModel.findOne({ userId: userId }).exec(),
    ]);

    const totalIncome = incomes.reduce(
      (sum: number, i: any) => sum + i.totalAmount,
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum: number, e: any) => sum + e.amount,
      0,
    );
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const categories: CategoryReport[] = [];
    const overBudget: string[] = [];
    const underUtilised: string[] = [];
    const unused: string[] = [];

    if (budget) {
      for (const cat of budget.categories) {
        const budgetedAmount = totalIncome * (cat.percentage / 100);
        const actualSpent = expenses
          .filter(
            (e: any) => e.category?.toLowerCase() === cat.name?.toLowerCase(),
          )
          .reduce((sum: number, e: any) => sum + e.amount, 0);
        const variance = budgetedAmount - actualSpent;
        const utilisationPercent =
          budgetedAmount > 0 ? (actualSpent / budgetedAmount) * 100 : 0;

        let status: CategoryReport['status'];
        if (actualSpent === 0) {
          status = 'unused';
          unused.push(cat.name);
        } else if (utilisationPercent > 100) {
          status = 'over';
          overBudget.push(cat.name);
        } else if (utilisationPercent < 50) {
          status = 'under_utilised';
          underUtilised.push(cat.name);
        } else {
          status = 'on_track';
        }

        categories.push({
          name: cat.name,
          budgetedPercent: cat.percentage,
          budgetedAmount: Math.round(budgetedAmount * 100) / 100,
          actualSpent: Math.round(actualSpent * 100) / 100,
          variance: Math.round(variance * 100) / 100,
          utilisationPercent: Math.round(utilisationPercent * 100) / 100,
          status,
        });
      }
    }

    const prevStart = new Date(year, month - 2, 1);
    const prevEnd = new Date(year, month - 1, 1);
    const [prevIncomes, prevExpenses] = await Promise.all([
      this.incomeModel
        .find({ userId: userId, date: { $gte: prevStart, $lt: prevEnd } })
        .exec(),
      this.expenseModel
        .find({ userId: userId, date: { $gte: prevStart, $lt: prevEnd } })
        .exec(),
    ]);
    const prevIncome = prevIncomes.reduce(
      (s: number, i: any) => s + i.totalAmount,
      0,
    );
    const prevExpense = prevExpenses.reduce(
      (s: number, e: any) => s + e.amount,
      0,
    );

    return {
      year,
      month,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate: Math.round(savingsRate * 100) / 100,
      categories,
      overBudget,
      underUtilised,
      unused,
      prevMonth:
        prevIncome > 0 || prevExpense > 0
          ? {
              totalIncome: Math.round(prevIncome * 100) / 100,
              totalExpenses: Math.round(prevExpense * 100) / 100,
              netSavings: Math.round((prevIncome - prevExpense) * 100) / 100,
            }
          : null,
    };
  }
}
