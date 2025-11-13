export interface Budget {
  _id?: string;
  category: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date | string;
  endDate?: Date | string;
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface BudgetStatus {
  _id: string;
  category: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentageUsed: number;
  status: 'safe' | 'warning' | 'exceeded';
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date | string;
  endDate: Date | string;
}

export interface BudgetOverview {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  categoriesOverBudget: number;
  categoriesOnTrack: number;
  totalCategories: number;
}