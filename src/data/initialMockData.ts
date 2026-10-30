import { Transaction, SplitGroup, SplitExpense, Settlement, MonthlyOverviewPoint } from '../types/finance';

// All static transactions removed - live data is loaded dynamically
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Monthly overview data is calculated dynamically from live transactions
export const INITIAL_MONTHLY_DATA: MonthlyOverviewPoint[] = [];

// Split bills groups start empty and are fully user-created
export const INITIAL_GROUPS: SplitGroup[] = [];

export const INITIAL_SPLIT_EXPENSES: SplitExpense[] = [];

export const INITIAL_SETTLEMENTS: Settlement[] = [];
