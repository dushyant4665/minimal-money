export interface Transaction {
  _id?: string;
  amount: number;
  date: string;
  description: string;
  type: 'expense' | 'income';
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  _id?: string;
  name: string;
  color: string;
  icon: string;
}

export interface Budget {
  _id?: string;
  category: string;
  amount: number;
  month: string; // Format: YYYY-MM
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MonthlyExpense {
  month: string;
  total: number;
}

export interface CategoryExpense {
  category: string;
  total: number;
  percentage: number;
}

export interface DashboardStats {
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  recentTransactions: Transaction[];
  monthlyExpenses: MonthlyExpense[];
  categoryExpenses: CategoryExpense[];
  budgets: Budget[];
  budgetVsActual: { category: string; budget: number; actual: number }[];
  insights: string[];
} 