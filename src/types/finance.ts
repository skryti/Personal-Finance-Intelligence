export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Income'
  | 'Other';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO YYYY-MM-DD
  notes?: string;
}

export type SplitType = 'equal' | 'custom';

export interface SplitAllocation {
  member: string;
  amount: number;
}

export interface SplitExpense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string; // Member name, e.g., 'You' or 'Rahul'
  splitType: SplitType;
  allocations: SplitAllocation[];
  date: string; // ISO YYYY-MM-DD
}

export interface Settlement {
  id: string;
  groupId: string;
  fromMember: string; // Debtor
  toMember: string;   // Creditor
  amount: number;
  date: string;
  notes?: string;
}

export interface SplitGroup {
  id: string;
  name: string;
  description?: string;
  members: string[]; // e.g. ['You', 'Rahul', 'Priya']
  createdAt: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number; // percentage, e.g. 81.7
}

export interface CategorySpending {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyOverviewPoint {
  month: string; // 'Jul', 'Aug', 'Sep'
  income: number;
  expenses: number;
  savings: number;
}

export interface MemberBalance {
  member: string;
  paid: number;
  share: number;
  netBalance: number; // paid - share (+ = is owed, - = owes)
}

export interface SplitLedgerSummary {
  totalYouOwe: number;
  totalOthersOweYou: number;
  netBalance: number;
  groupBalances: Record<string, MemberBalance[]>;
}

export type TabType = 'dashboard' | 'transactions' | 'analytics' | 'split-bills' | 'settings';
