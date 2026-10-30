# Analysis & Architectural Specification: Types, Mock Data & FinanceContext

**Author**: `m1_explorer_3`  
**Milestone**: M1 (Core Foundation & Data Architecture)  
**Date**: 2026-10-30  

---

## 1. Executive Summary

This document specifies the exact, production-ready implementation of:
1. **Canonical TypeScript Data Models (`src/types/index.ts`)**: Exhaustive interfaces for single transactions, split expense ledgers, financial summaries, category aggregations, and monthly comparison points.
2. **Spec-Compliant Initial Mock Dataset (`src/data/mockData.ts`)**: Mathematical dataset strictly calibrated to satisfy R2 requirements:
   - **Total Balance**: ₹24,500
   - **Total Income**: ₹30,000 (Monthly Salary)
   - **Total Expenses**: ₹5,500 (Food ₹2,100, Shopping ₹1,200, Travel ₹750, Bills ₹999, Entertainment ₹451)
   - **Net Savings**: ₹24,500 (Savings Rate: 81.67%)
   - **Historical Months**: July, August, September comparative trend data
   - **Split Bills Group**: "Apartment Flatmates" with net balance where **"You are owed ₹200"**
   - **Dynamic Insights**: Automated financial intelligence tips
3. **Reactive State & Persistence Engine (`src/context/FinanceContext.tsx`)**: Full React Context provider and custom `useFinance` hook with real-time reactive memoized selectors, full CRUD actions, tab navigation, and robust `localStorage` synchronization with crash-proof fallbacks.

---

## 2. Canonical TypeScript Data Models (`src/types/index.ts`)

### Design Principles
- **Strict Typing**: Zero `any` types; all enums and literal unions are closed and descriptive.
- **Bi-directional Split Ledger Support**: Full models for equal split, custom split allocations, and pairwise debt resolutions.
- **Fintech UI Alignment**: Types include category color tokens, icon identifiers, and UI state indicators.

### Complete Specification for `src/types/index.ts`

```typescript
/**
 * Canonical TypeScript Models for Personal Finance Intelligence
 */

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Food'
  | 'Shopping'
  | 'Travel'
  | 'Bills'
  | 'Entertainment'
  | 'Income'
  | 'Other';

export type PaymentMethod = 'UPI' | 'Card' | 'NetBanking' | 'Cash';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // ISO format 'YYYY-MM-DD'
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt?: string;
}

export interface FinancialSummary {
  totalBalance: number;    // totalIncome - totalExpenses
  totalIncome: number;     // sum of income transactions
  totalExpenses: number;   // sum of expense transactions
  savings: number;         // totalIncome - totalExpenses
  savingsRate: number;     // (savings / totalIncome) * 100
  expenseCount: number;
  incomeCount: number;
}

export interface CategorySpending {
  category: TransactionCategory;
  amount: number;
  percentage: number;      // 0 - 100 relative to total expenses
  count: number;
  color: string;           // Hex color for charts & indicators
  icon: string;            // Lucide icon name
}

export interface MonthlyOverviewPoint {
  month: string;           // 'Jul', 'Aug', 'Sep'
  year?: number;
  income: number;
  expenses: number;
  savings: number;
}

export interface MoMTrend {
  percentage: number;      // e.g. -5.2% or +12.0%
  direction: 'up' | 'down' | 'neutral';
  isPositiveImprovement: boolean; // For expenses, down is positive; for income/savings, up is positive
}

// ==========================================
// Split Bills Module Types
// ==========================================

export interface SplitMember {
  id: string;
  name: string;
  avatarColor?: string;
}

export type SplitMode = 'equal' | 'custom';

export interface SplitAllocation {
  memberName: string;
  amount: number;
}

export interface SplitExpense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  paidBy: string;          // memberName, e.g. 'You'
  date: string;            // ISO format 'YYYY-MM-DD'
  splitMode: SplitMode;
  splits: SplitAllocation[];
  category?: TransactionCategory;
  createdAt?: string;
}

export interface Settlement {
  id: string;
  groupId: string;
  from: string;            // Payer member name
  to: string;              // Receiver member name
  amount: number;
  date: string;            // ISO format 'YYYY-MM-DD'
  note?: string;
  createdAt?: string;
}

export interface SplitGroup {
  id: string;
  name: string;
  description?: string;
  members: string[];       // Array of member names: ['You', 'Rahul', 'Priya']
  expenses: SplitExpense[];
  settlements: Settlement[];
  createdAt: string;
  updatedAt?: string;
}

export interface MemberBalance {
  memberName: string;
  totalPaid: number;       // Total paid by member in group expenses
  totalOwed: number;       // Total assigned to member across expense splits
  totalSent: number;       // Total settlements paid out
  totalReceived: number;   // Total settlements received
  netBalance: number;      // (totalPaid - totalOwed) + (totalSent - totalReceived)
  status: 'owes' | 'owed' | 'settled';
}

export interface SimplifiedDebt {
  from: string;            // Debtor member name
  to: string;              // Creditor member name
  amount: number;
}

export interface SplitLedgerSummary {
  totalGroups: number;
  totalYouOwe: number;        // Sum of net amounts You owe to others
  totalOthersOweYou: number;  // Sum of net amounts others owe to You (target: ₹200)
  activeExpensesCount: number;
}

// ==========================================
// Application & Navigation State Types
// ==========================================

export type TabType = 'dashboard' | 'transactions' | 'analytics' | 'split-bills' | 'settings';

export type TimeFilter = 'all' | '1m' | '3m' | '6m' | '1y';

export interface FinancialInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
  metric?: string;
}

export interface CategoryInfo {
  category: TransactionCategory;
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}
```

---

## 3. Spec-Compliant Initial Mock Dataset (`src/data/mockData.ts`)

### Mathematical Calibration
The mock dataset is designed to strictly satisfy all numerical and UI invariants specified in R2, R3, and R5:
1. **Total Income**: ₹30,000 (Monthly Salary)
2. **Total Expenses**: ₹5,500
   - Food: ₹850 + ₹650 + ₹600 = **₹2,100**
   - Shopping: ₹750 + ₹450 = **₹1,200**
   - Travel: ₹420 + ₹330 = **₹750**
   - Bills: ₹999 = **₹999**
   - Entertainment: ₹451 = **₹451**
   - **Sum**: 2100 + 1200 + 750 + 999 + 451 = **₹5,500.00**
3. **Total Balance & Savings**: ₹30,000 - ₹5,500 = **₹24,500.00** (Savings Rate = 81.67%)
4. **Auto-Categorization Validation**: Every expense description contains exact keywords matching the 6 auto-categorization dictionaries (`swiggy`, `zomato`, `cafe`, `amazon`, `clothes`, `uber`, `metro`, `wifi`, `recharge`, `netflix`, `salary`).
5. **Split Bills Ledger**:
   - Group "Apartment Flatmates": You, Rahul, Priya.
   - Expense: You paid ₹600 (Groceries split 3 ways = ₹200 each).
   - Settlement: Priya paid ₹200 to You.
   - Result: Priya net = 0; Rahul net = -200 (owes ₹200); You net = +200 (**"You are owed ₹200"**).
   - Group "Weekend Roadtrip": You, Amit, Neha. Amit paid ₹300 (₹100 each). You settled ₹100 to Amit. Net for You = 0.
   - Cross-group aggregate: Total Others Owe You = **₹200**, Total You Owe = **₹0**.

### Complete Specification for `src/data/mockData.ts`

```typescript
import {
  Transaction,
  SplitGroup,
  MonthlyOverviewPoint,
  CategoryInfo,
  FinancialInsight,
} from '../types';

export const CURRENT_USER = 'You';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Income
  {
    id: 'tx-1',
    description: 'Monthly Salary Credit - Tech Corp',
    amount: 30000,
    type: 'income',
    category: 'Income',
    date: '2026-09-01',
    paymentMethod: 'NetBanking',
    notes: 'Direct monthly payroll deposit',
  },
  // Food Expenses (Total: ₹2,100)
  {
    id: 'tx-2',
    description: 'Swiggy Gourmet Dinner & Drinks',
    amount: 850,
    type: 'expense',
    category: 'Food',
    date: '2026-09-24',
    paymentMethod: 'UPI',
    notes: 'Dinner with flatmates',
  },
  {
    id: 'tx-3',
    description: 'Zomato Team Lunch Order',
    amount: 650,
    type: 'expense',
    category: 'Food',
    date: '2026-09-20',
    paymentMethod: 'UPI',
    notes: 'Office team lunch delivery',
  },
  {
    id: 'tx-4',
    description: 'Blue Tokai Cafe & Roastery',
    amount: 600,
    type: 'expense',
    category: 'Food',
    date: '2026-09-15',
    paymentMethod: 'Card',
    notes: 'Coffee and breakfast pastry',
  },
  // Shopping Expenses (Total: ₹1,200)
  {
    id: 'tx-5',
    description: 'Amazon Prime Essentials & Organizer',
    amount: 750,
    type: 'expense',
    category: 'Shopping',
    date: '2026-09-22',
    paymentMethod: 'Card',
    notes: 'Home work-desk accessories',
  },
  {
    id: 'tx-6',
    description: 'Myntra Cotton Clothes & Socks',
    amount: 450,
    type: 'expense',
    category: 'Shopping',
    date: '2026-09-18',
    paymentMethod: 'UPI',
    notes: 'Casual daily wear',
  },
  // Travel Expenses (Total: ₹750)
  {
    id: 'tx-7',
    description: 'Uber Premier Office Commute Cab',
    amount: 420,
    type: 'expense',
    category: 'Travel',
    date: '2026-09-25',
    paymentMethod: 'UPI',
    notes: 'Morning rush hour travel',
  },
  {
    id: 'tx-8',
    description: 'Delhi Metro Smart Card Recharge',
    amount: 330,
    type: 'expense',
    category: 'Travel',
    date: '2026-09-10',
    paymentMethod: 'UPI',
    notes: 'Monthly transit balance top-up',
  },
  // Bills Expenses (Total: ₹999)
  {
    id: 'tx-9',
    description: 'Airtel Fiber Broadband Wifi Bill Recharge',
    amount: 999,
    type: 'expense',
    category: 'Bills',
    date: '2026-09-05',
    paymentMethod: 'NetBanking',
    notes: '200 Mbps unlimited plan',
  },
  // Entertainment Expenses (Total: ₹451)
  {
    id: 'tx-10',
    description: 'Netflix Monthly Premium 4K Plan',
    amount: 451,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-09-12',
    paymentMethod: 'Card',
    notes: 'Family auto-renewal subscription',
  },
];

export const INITIAL_SPLIT_GROUPS: SplitGroup[] = [
  {
    id: 'group-flatmates',
    name: 'Apartment Flatmates',
    description: 'Shared household groceries, utilities & supplies',
    members: ['You', 'Rahul', 'Priya'],
    createdAt: '2026-09-01T10:00:00Z',
    expenses: [
      {
        id: 'exp-101',
        groupId: 'group-flatmates',
        description: 'Monthly Groceries & Household Supplies',
        amount: 600,
        paidBy: 'You',
        date: '2026-09-10',
        splitMode: 'equal',
        splits: [
          { memberName: 'You', amount: 200 },
          { memberName: 'Rahul', amount: 200 },
          { memberName: 'Priya', amount: 200 },
        ],
        category: 'Food',
        createdAt: '2026-09-10T11:00:00Z',
      },
    ],
    settlements: [
      {
        id: 'stl-101',
        groupId: 'group-flatmates',
        from: 'Priya',
        to: 'You',
        amount: 200,
        date: '2026-09-14',
        note: 'UPI Payment - Groceries share cleared',
        createdAt: '2026-09-14T14:30:00Z',
      },
    ],
  },
  {
    id: 'group-roadtrip',
    name: 'Weekend Roadtrip',
    description: 'Fuel, highway toll and cafe stops',
    members: ['You', 'Amit', 'Neha'],
    createdAt: '2026-08-25T08:00:00Z',
    expenses: [
      {
        id: 'exp-201',
        groupId: 'group-roadtrip',
        description: 'Highway Expressway Toll & Fuel',
        amount: 300,
        paidBy: 'Amit',
        date: '2026-09-02',
        splitMode: 'equal',
        splits: [
          { memberName: 'You', amount: 100 },
          { memberName: 'Amit', amount: 100 },
          { memberName: 'Neha', amount: 100 },
        ],
        category: 'Travel',
        createdAt: '2026-09-02T16:00:00Z',
      },
    ],
    settlements: [
      {
        id: 'stl-201',
        groupId: 'group-roadtrip',
        from: 'You',
        to: 'Amit',
        amount: 100,
        date: '2026-09-03',
        note: 'GPay - Highway toll settled',
        createdAt: '2026-09-03T09:15:00Z',
      },
    ],
  },
];

export const INITIAL_MONTHLY_OVERVIEW: MonthlyOverviewPoint[] = [
  { month: 'Jul', year: 2026, income: 28000, expenses: 6200, savings: 21800 },
  { month: 'Aug', year: 2026, income: 29000, expenses: 5800, savings: 23200 },
  { month: 'Sep', year: 2026, income: 30000, expenses: 5500, savings: 24500 },
];

export const CATEGORY_METADATA: Record<string, CategoryInfo> = {
  Food: {
    category: 'Food',
    label: 'Food & Dining',
    color: '#F97316', // Orange-500
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    iconName: 'Utensils',
  },
  Shopping: {
    category: 'Shopping',
    label: 'Shopping',
    color: '#EC4899', // Pink-500
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    iconName: 'ShoppingBag',
  },
  Travel: {
    category: 'Travel',
    label: 'Travel & Transport',
    color: '#3B82F6', // Blue-500
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    iconName: 'Car',
  },
  Bills: {
    category: 'Bills',
    label: 'Bills & Utilities',
    color: '#8B5CF6', // Purple-500
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    iconName: 'Receipt',
  },
  Entertainment: {
    category: 'Entertainment',
    label: 'Entertainment',
    color: '#F59E0B', // Amber-500
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    iconName: 'Film',
  },
  Income: {
    category: 'Income',
    label: 'Income & Salary',
    color: '#10B981', // Emerald-500
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    iconName: 'TrendingUp',
  },
  Other: {
    category: 'Other',
    label: 'Other Expenses',
    color: '#64748B', // Slate-500
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
    iconName: 'Tag',
  },
};

export const INITIAL_INSIGHTS: FinancialInsight[] = [
  {
    id: 'ins-1',
    type: 'success',
    title: 'Outstanding Savings Rate',
    message: 'You have saved 81.7% of your monthly income (₹24,500), exceeding the recommended 50/30/20 guideline.',
    metric: '81.7% Saved',
  },
  {
    id: 'ins-2',
    type: 'info',
    title: 'Top Expense Category',
    message: 'Food & Dining represents your largest monthly expense at ₹2,100 (38.2% of total expenses).',
    metric: '₹2,100 Food',
  },
  {
    id: 'ins-3',
    type: 'tip',
    title: 'Pending Split Settlement',
    message: 'Rahul owes you ₹200 from the Apartment Flatmates shared grocery bill.',
    metric: '₹200 Receivable',
  },
  {
    id: 'ins-4',
    type: 'success',
    title: 'Fixed Utility Discipline',
    message: 'Your broadband wifi and subscriptions remain strictly under ₹1,500/month.',
    metric: '₹1,450 Total',
  },
];
```

---

## 4. Reactive State & Persistence Engine (`src/context/FinanceContext.tsx`)

### Architecture & Capabilities
1. **Isolated State**: `transactions`, `splitGroups`, and `activeTab` are held as top-level reactive state.
2. **Safe Persistence Layer**: Uses a unified `loadFromStorage` and `saveToStorage` helper wrapped in try/catch to gracefully handle `SecurityError`, private mode, or storage quotas.
3. **Reactive Selectors**:
   - `financialSummary`: Real-time calculation of Total Balance, Income, Expenses, Savings, and Savings Rate.
   - `categoryBreakdown`: Dynamic grouping of expenses with percentages, counts, and colors.
   - `monthlyOverview`: Consolidated view across Jul, Aug, Sep and any new entries.
   - `splitLedgerSummary`: Computes `totalOthersOweYou` (₹200) and `totalYouOwe` (₹0) across all groups.
4. **CRUD Actions**:
   - `addTransaction`: Auto-assigns ID, preserves ISO timestamps, prepends to transaction list.
   - `updateTransaction`: Immutable update of targeted transaction attributes.
   - `deleteTransaction`: Atomic removal of transaction.
   - `createGroup`: Adds new split group with 'You' automatically included.
   - `addSplitExpense`: Appends expense with equal or custom split allocations.
   - `recordSettlement`: Appends settlement payment and immediately re-evaluates net balances.
   - `resetToMockData`: One-click restoration of initial dataset, crucial for demonstration and testing.

### Complete Specification for `src/context/FinanceContext.tsx`

```tsx
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Transaction,
  SplitGroup,
  SplitExpense,
  Settlement,
  FinancialSummary,
  CategorySpending,
  MonthlyOverviewPoint,
  SplitLedgerSummary,
  TabType,
  FinancialInsight,
} from '../types';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_SPLIT_GROUPS,
  INITIAL_MONTHLY_OVERVIEW,
  CATEGORY_METADATA,
  INITIAL_INSIGHTS,
  CURRENT_USER,
} from '../data/mockData';
import {
  calculateFinancialSummary,
  calculateCategorySpending,
  calculateMonthlyOverview,
} from '../utils/calculations';
import { calculateOverallSplitSummary } from '../utils/splitLedger';

const STORAGE_KEYS = {
  TRANSACTIONS: 'pfi_transactions_v1',
  SPLIT_GROUPS: 'pfi_split_groups_v1',
  ACTIVE_TAB: 'pfi_active_tab_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[FinanceContext] Failed to load ${key} from localStorage, using fallback:`, error);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[FinanceContext] Failed to save ${key} to localStorage:`, error);
  }
}

export interface FinanceContextType {
  // Core State
  transactions: Transaction[];
  splitGroups: SplitGroup[];
  activeTab: TabType;
  insights: FinancialInsight[];

  // Navigation
  setActiveTab: (tab: TabType) => void;

  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Split Bills Actions
  createGroup: (name: string, members: string[], description?: string) => string;
  addSplitExpense: (groupId: string, expense: Omit<SplitExpense, 'id' | 'createdAt'>) => SplitExpense;
  recordSettlement: (groupId: string, settlement: Omit<Settlement, 'id' | 'createdAt'>) => Settlement;
  deleteGroup: (groupId: string) => void;

  // Derived Selectors
  financialSummary: FinancialSummary;
  categoryBreakdown: CategorySpending[];
  monthlyOverview: MonthlyOverviewPoint[];
  splitLedgerSummary: SplitLedgerSummary;
  recentTransactions: Transaction[];

  // Data Management
  resetToMockData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS)
  );

  const [splitGroups, setSplitGroups] = useState<SplitGroup[]>(() =>
    loadStorage<SplitGroup[]>(STORAGE_KEYS.SPLIT_GROUPS, INITIAL_SPLIT_GROUPS)
  );

  const [activeTab, setActiveTabState] = useState<TabType>(() =>
    loadStorage<TabType>(STORAGE_KEYS.ACTIVE_TAB, 'dashboard')
  );

  // Sync state to LocalStorage
  useEffect(() => {
    saveStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
  }, [transactions]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.SPLIT_GROUPS, splitGroups);
  }, [splitGroups]);

  useEffect(() => {
    saveStorage(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
  };

  // Transaction Actions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Split Bills Actions
  const createGroup = (name: string, members: string[], description?: string): string => {
    const uniqueMembers = Array.from(new Set([CURRENT_USER, ...members]));
    const newGroupId = `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newGroup: SplitGroup = {
      id: newGroupId,
      name,
      description: description || '',
      members: uniqueMembers,
      expenses: [],
      settlements: [],
      createdAt: new Date().toISOString(),
    };
    setSplitGroups((prev) => [newGroup, ...prev]);
    return newGroupId;
  };

  const addSplitExpense = (
    groupId: string,
    expense: Omit<SplitExpense, 'id' | 'createdAt'>
  ): SplitExpense => {
    const newExpense: SplitExpense = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setSplitGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          expenses: [newExpense, ...group.expenses],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    return newExpense;
  };

  const recordSettlement = (
    groupId: string,
    settlement: Omit<Settlement, 'id' | 'createdAt'>
  ): Settlement => {
    const newSettlement: Settlement = {
      ...settlement,
      id: `stl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setSplitGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        return {
          ...group,
          settlements: [newSettlement, ...group.settlements],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    return newSettlement;
  };

  const deleteGroup = (groupId: string) => {
    setSplitGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  const resetToMockData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setSplitGroups(INITIAL_SPLIT_GROUPS);
    setActiveTabState('dashboard');
    saveStorage(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    saveStorage(STORAGE_KEYS.SPLIT_GROUPS, INITIAL_SPLIT_GROUPS);
    saveStorage(STORAGE_KEYS.ACTIVE_TAB, 'dashboard');
  };

  // Derived Selectors (Memoized for optimal performance)
  const financialSummary = useMemo<FinancialSummary>(() => {
    return calculateFinancialSummary(transactions);
  }, [transactions]);

  const categoryBreakdown = useMemo<CategorySpending[]>(() => {
    return calculateCategorySpending(transactions, CATEGORY_METADATA);
  }, [transactions]);

  const monthlyOverview = useMemo<MonthlyOverviewPoint[]>(() => {
    return calculateMonthlyOverview(transactions, INITIAL_MONTHLY_OVERVIEW);
  }, [transactions]);

  const splitLedgerSummary = useMemo<SplitLedgerSummary>(() => {
    return calculateOverallSplitSummary(splitGroups, CURRENT_USER);
  }, [splitGroups]);

  const recentTransactions = useMemo<Transaction[]>(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const insights = useMemo<FinancialInsight[]>(() => {
    return INITIAL_INSIGHTS;
  }, []);

  const value: FinanceContextType = {
    transactions,
    splitGroups,
    activeTab,
    insights,
    setActiveTab,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    createGroup,
    addSplitExpense,
    recordSettlement,
    deleteGroup,
    financialSummary,
    categoryBreakdown,
    monthlyOverview,
    splitLedgerSummary,
    recentTransactions,
    resetToMockData,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
```

---

## 5. Peer Contract Reconciliation & Invariant Verification

| Contract / Requirement | Expected | Formulated Solution | Status |
|------------------------|----------|---------------------|--------|
| Total Income | ₹30,000 | 1 Salary transaction = ₹30,000 | PASS |
| Total Expenses | ₹5,500 | 9 transactions summing to ₹5,500 across 5 categories | PASS |
| Total Balance | ₹24,500 | ₹30,000 - ₹5,500 = ₹24,500 | PASS |
| Savings Rate | 81.67% | (₹24,500 / ₹30,000) * 100 | PASS |
| Food Expenses | ₹2,100 | Swiggy (₹850) + Zomato (₹650) + Blue Tokai (₹600) | PASS |
| Shopping Expenses | ₹1,200 | Amazon (₹750) + Myntra (₹450) | PASS |
| Travel Expenses | ₹750 | Uber (₹420) + Metro (₹330) | PASS |
| Bills Expenses | ₹999 | Airtel Fiber Broadband Wifi (₹999) | PASS |
| Entertainment Expenses | ₹451 | Netflix (₹451) | PASS |
| Active Split Group | Apartment Flatmates | You, Rahul, Priya; Grocery ₹600 split 3 ways | PASS |
| Settlements | Priya -> You ₹200 | Priya clears ₹200 share via UPI | PASS |
| Net Split Receivable | ₹200 owed to You | Rahul owes ₹200, Priya owes ₹0 -> You are owed ₹200 | PASS |
| LocalStorage Support | Persistent state | Keyed storage with try/catch fallback and reset feature | PASS |
