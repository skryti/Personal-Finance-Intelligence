import { Transaction, SplitGroup, SplitExpense, Settlement, MonthlyOverviewPoint } from '../types/finance';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Tech Corp Monthly Salary',
    amount: 30000,
    type: 'income',
    category: 'Income',
    date: '2026-09-01',
    notes: 'Primary monthly salary credit',
  },
  {
    id: 'tx-2',
    description: 'Swiggy Gourmet Dinner & Drinks',
    amount: 1450,
    type: 'expense',
    category: 'Food',
    date: '2026-09-18',
  },
  {
    id: 'tx-3',
    description: 'Blue Tokai Cafe Artisan Roast',
    amount: 650,
    type: 'expense',
    category: 'Food',
    date: '2026-09-24',
  },
  {
    id: 'tx-4',
    description: 'Myntra Autumn Apparel & Sneakers',
    amount: 1200,
    type: 'expense',
    category: 'Shopping',
    date: '2026-09-12',
  },
  {
    id: 'tx-5',
    description: 'Uber Premier Airport Ride',
    amount: 750,
    type: 'expense',
    category: 'Travel',
    date: '2026-09-15',
  },
  {
    id: 'tx-6',
    description: 'Airtel Fiber Broadband Bill',
    amount: 999,
    type: 'expense',
    category: 'Bills',
    date: '2026-09-05',
  },
  {
    id: 'tx-7',
    description: 'Netflix 4K Ultra Subscription',
    amount: 451,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-09-08',
  },
];

export const INITIAL_MONTHLY_DATA: MonthlyOverviewPoint[] = [
  { month: 'Jul', income: 28000, expenses: 6200, savings: 21800 },
  { month: 'Aug', income: 28000, expenses: 5800, savings: 22200 },
  { month: 'Sep', income: 30000, expenses: 5500, savings: 24500 },
];

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

export const INITIAL_SPLIT_EXPENSES: SplitExpense[] = [
  {
    id: 'sexp-1',
    groupId: 'grp-1',
    description: 'Weekend Feast & Groceries',
    amount: 600,
    paidBy: 'You',
    splitType: 'equal',
    allocations: [
      { member: 'You', amount: 200 },
      { member: 'Rahul', amount: 200 },
      { member: 'Priya', amount: 200 },
    ],
    date: '2026-09-20',
  },
];

export const INITIAL_SETTLEMENTS: Settlement[] = [
  {
    id: 'set-1',
    groupId: 'grp-1',
    fromMember: 'Priya',
    toMember: 'You',
    amount: 200,
    date: '2026-09-22',
    notes: 'UPI transfer for dinner split',
  },
];
