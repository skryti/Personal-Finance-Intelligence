import { Transaction, SplitGroup, SplitExpense, Settlement, MonthlyOverviewPoint } from '../types/finance';

// All static transactions removed - live data is loaded dynamically from Supabase
export const INITIAL_TRANSACTIONS: Transaction[] = [];

// Monthly overview data is calculated dynamically from live transactions
export const INITIAL_MONTHLY_DATA: MonthlyOverviewPoint[] = [];

export const INITIAL_GROUPS: SplitGroup[] = [
  {
    id: 'grp-1',
    name: 'Apartment Flatmates',
    description: 'Shared utilities and weekend group dinners',
    members: ['You', 'Rahul', 'Priya'],
    createdAt: '2026-08-01',
  },
  {
    id: 'grp-2',
    name: 'Goa Road Trip',
    description: 'Fuel, cottage stay and food',
    members: ['You', 'Aman', 'Sneha'],
    createdAt: '2026-09-10',
  },
];

export const INITIAL_SPLIT_EXPENSES: SplitExpense[] = [];

export const INITIAL_SETTLEMENTS: Settlement[] = [];
