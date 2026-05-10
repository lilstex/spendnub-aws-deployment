export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export type InvestmentType =
  | 'stock'
  | 'etf'
  | 'crypto'
  | 'bond'
  | 'mutual_fund'
  | 'real_estate'
  | 'other';

export interface Investment {
  _id: string;
  platform: string;
  investmentType: InvestmentType;
  instrumentName: string;
  amount: number;
  unitPrice?: number;
  units?: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface CreateInvestmentPayload {
  platform: string;
  investmentType: InvestmentType;
  instrumentName: string;
  amount: number;
  unitPrice?: number;
  units?: number;
  date?: string;
  notes?: string;
}

export interface InvestmentPortfolioSummary {
  totalDeployed: number;
  count: number;
  byType: Record<string, number>;
  byPlatform: Record<string, number>;
}

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

export interface CategoryProjection {
  name: string;
  budgetedAmount: number;
  spentSoFar: number;
  projectedMonthEnd: number;
  projectedVariance: number;
  onPaceToOvershoot: boolean;
}

export interface EnhancedForecast {
  avgMonthlyIncome: number;
  projectedTotalSpend: number;
  projectedSavings: number;
  projectedSavingsRate: number;
  daysElapsed: number;
  daysInMonth: number;
  categoryProjections: CategoryProjection[];
  recommendations: { category: string; message: string }[];
}
