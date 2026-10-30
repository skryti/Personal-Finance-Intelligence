# Architectural & Verification Design Analysis: Personal Finance Intelligence

**Author**: `survey_explorer_2`  
**Date**: 2026-10-30  
**Context**: Greenfield design for React (Vite) Single Page Application per `ORIGINAL_REQUEST.md`.  
**Directory**: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence`  

---

## Executive Summary

This document establishes the foundational software architecture, component hierarchy, state management contracts (`FinanceContext`), canonical TypeScript data models, exact initial mock dataset adhering to R2 financial requirements (Total Balance ₹24,500, Income ₹30,000, Expenses ₹5,500, Savings ₹24,500, Jul/Aug/Sep comparisons, and "You are owed ₹200"), calculation engine specifications, and automated Vitest test harness design.

---

## 1. Component Architecture & UI Hierarchy

### 1.1 Structural Layout & Shell
The application is structured as a responsive single-page application with a fixed left sidebar, dynamic header, and main view router. The styling implements the fintech aesthetic with a soft background (`bg-slate-50` / `#F8FAFC`), crisp white rounded-2xl cards (`bg-white rounded-2xl border border-slate-100 shadow-sm`), and clean typography.

```
App
├── FinanceProvider (Context State & Recalculation Engine)
│   ├── Shell Layout (min-h-screen flex bg-slate-50)
│   │   ├── Sidebar (fixed left-0 top-0 w-64 h-full border-r border-slate-200 bg-white)
│   │   │   ├── BrandHeader (Fintech logo icon, title "Personal Finance Intelligence", badge "v1.0")
│   │   │   ├── NavigationMenu (Dashboard, Transactions, Analytics, Split Bills, Settings)
│   │   │   │   └── NavItem (Lucide icons: LayoutDashboard, ReceiptText, PieChart, Users, Settings)
│   │   │   └── SidebarFooterSummary (Live mini pill: Net Balance ₹24,500, status indicator)
│   │   │
│   │   ├── ContentContainer (flex-1 ml-64 flex flex-col min-w-0)
│   │   │   ├── TopHeader (sticky top-0 h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-8)
│   │   │   │   ├── DynamicGreeting ("Good afternoon, Sanskriti" based on client local time)
│   │   │   │   ├── DateBadge (Current date formatted e.g. "Friday, Oct 30, 2026")
│   │   │   │   ├── HeaderActions (Global Search bar, Quick Add (+) button, Notification bell)
│   │   │   │   └── UserAvatar (Initial avatar with green online badge)
│   │   │   │
│   │   │   ├── MainViewRouter (<main role="main" className="p-8 max-w-7xl mx-auto w-full space-y-8">)
│   │   │   │   ├── [activeTab === 'dashboard'] -> DashboardScreen
│   │   │   │   ├── [activeTab === 'transactions'] -> TransactionsScreen
│   │   │   │   ├── [activeTab === 'analytics'] -> AnalyticsScreen
│   │   │   │   ├── [activeTab === 'split-bills'] -> SplitBillsScreen
│   │   │   │   └── [activeTab === 'settings'] -> SettingsScreen
│   │   │   │
│   │   │   └── Footer (py-6 border-t border-slate-200 text-center text-xs text-slate-400)
│   │   │       └── "Personal Finance Intelligence • Modern Fintech Expense Ledger"
│   │   │
│   │   └── GlobalModals
│   │       ├── AddTransactionModal
│   │       ├── CreateGroupModal
│   │       ├── AddSplitExpenseModal
│   │       └── SettleUpModal
```

### 1.2 View Breakdown & Subcomponent Hierarchy

#### 1.2.1 DashboardScreen (Requirement R2)
- **Top Financial Summary Cards (4-column grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`)**:
  1. `Total Balance Card`: ₹24,500 | Blue icon badge (`Wallet`, `bg-blue-50 text-blue-600`) | subtitle: "Available funds"
  2. `Total Income Card`: ₹30,000 | Green icon badge (`ArrowDownLeft`, `bg-emerald-50 text-emerald-600`) | subtitle: "Current month"
  3. `Total Expenses Card`: ₹5,500 | Rose icon badge (`ArrowUpRight`, `bg-rose-50 text-rose-600`) | subtitle: "Current month"
  4. `Total Savings Card`: ₹24,500 | Amber/Indigo icon badge (`PiggyBank`, `bg-indigo-50 text-indigo-600`) | subtitle: "81.7% savings rate"
- **Middle Row Grid (`grid-cols-1 lg:grid-cols-3 gap-6`)**:
  1. `CategoryDonutCard` (Recharts PieChart donut):
     - Center custom SVG / HTML overlay: `"₹5,500"` in bold `text-2xl font-bold` + `"Total Spent"` in `text-xs text-slate-400`.
     - Time filter tabs ("This Month", "Last 30 Days").
     - Category legend breakdown (Food ₹2,100, Shopping ₹1,200, Travel ₹750, Bills ₹999, Entertainment ₹451).
  2. `MonthlyOverviewCard` (Recharts Grouped BarChart):
     - Compares Income vs Expenses across Jul, Aug, Sep.
     - Custom rounded bar tops (`radius={[6, 6, 0, 0]}`), custom tooltip formatting ₹ currency, clean gridlines (`strokeDasharray="3 3"`).
  3. `QuickActionsCard`:
     - Quick action buttons with fintech styling:
       - `+ Add Transaction` (opens `AddTransactionModal`)
       - `+ Create Split Bill` (opens `AddSplitExpenseModal`)
       - `View Analytics` (switches activeTab to `'analytics'`)
       - `Set Budgets` (opens budget configuration)
- **Bottom Row Grid (`grid-cols-1 lg:grid-cols-3 gap-6`)**:
  1. `RecentTransactionsCard` (lg:col-span-2 or 1.5):
     - Interactive table of the 5 most recent transactions.
     - Columns: Date, Description + Category Icon, Category Pill, Amount (+₹ / -₹ color-coded), Type Badge.
     - "View All" link directing to Transactions view.
  2. `SplitBillsQuickCard`:
     - Prominent status: `"You are owed ₹200"` in large emerald typography.
     - Active group summary ("Apartment Flatmates", "Rahul owes ₹200").
     - Quick "Settle Up" action button.
  3. `RecentInsightsCard`:
     - Dynamic bullet tips calculated from live data:
       * "🎯 Fantastic savings rate: 81.7% of your income saved this month."
       * "🍔 Food is your largest spending category (38.2% of total expenses)."
       * "👥 Split Ledger: ₹200 pending collection from active group trips."

#### 1.2.2 TransactionsScreen (Requirement R3)
- **Header & Action Bar**:
  - Search input with live filtering over `description` and `amount`.
  - Category dropdown filter (`All`, `Food`, `Travel`, `Shopping`, `Bills`, `Entertainment`, `Income`, `Other`).
  - Type toggle button group (`All`, `Expense`, `Income`).
  - `+ Add Transaction` button with emerald primary action style.
- **Dual-Column Layout (`grid grid-cols-1 lg:grid-cols-3 gap-8`)**:
  - `Main Column (lg:col-span-2)`: Complete transaction ledger table with sortable columns (Date, Description, Category, Amount), delete action with confirmation, and empty state handler.
  - `Summary Column (lg:col-span-1)`:
    - Quick Financial Summary card (Net Cash Flow, Total Inflow, Total Outflow).
    - Category Spending Breakdown list with proportional progress bars.
- **AddTransactionModal**:
  - Input fields: Description, Amount, Type (`expense` | `income`), Category, Date.
  - Real-time keyword auto-detection engine: as the user types in Description, detects keywords and updates category selector automatically (while preserving manual user selection if user manually selects).

#### 1.2.3 AnalyticsScreen (Requirement R4)
- **Metric Overview Row**:
  - Month-over-Month (MoM) trend badges:
    * Income change (+7.1% from Aug ₹28,000 to Sep ₹30,000)
    * Expenses change (-5.2% from Aug ₹5,800 to Sep ₹5,500)
    * Savings rate trend (81.7% vs 79.3% in Aug)
- **Visual Breakdown Row**:
  - Donut Chart with center label and hover tooltips.
  - Grouped Monthly Overview bar chart.
  - Horizontal progress bars for category spending with exact percentage widths (`style={{ width: `${pct}%` }}`).
- **Top Spending Insights Highlight Banner**:
  - Highest expense category highlight card (`Food` at ₹2,100).
  - Monthly savings highlight card (₹24,500 saved).
  - Budget health score pill (`Excellent` - 18.3% budget utilization against standard limit).

#### 1.2.4 SplitBillsScreen (Requirement R5)
- **Group Metrics Cards (4 cards)**:
  1. `Total Groups`: Count of active groups (e.g. 2).
  2. `Total You Owe`: ₹0 (or computed negative net balance).
  3. `Total Others Owe You`: ₹200 (computed positive net balance).
  4. `Recent Group Expenses`: Count of logged group expenses.
- **Groups Management & Ledger Interface**:
  - Group Selector tabs / cards (e.g., "Apartment Flatmates", "Goa Trip").
  - Member Avatar displays with name chips.
  - Individual Member Balances ledger table:
    * Member Name
    * Total Paid
    * Total Share Owed
    * Net Balance (+₹ is owed, -₹ owes)
    * Status pill ("Owes you ₹200", "Settled up", etc.)
  - Activity Timeline & Expense History log.
- **Modals**:
  - `CreateGroupModal`: Group name, description, member list (comma-separated or dynamic tag input including "You").
  - `AddSplitExpenseModal`: Description, Total Amount, Paid By dropdown, Split Type (`equal` vs `custom`), Dynamic allocation inputs with real-time sum validation.
  - `SettleUpModal`: Payer, Receiver, Amount, Date, Group selector.

---

## 2. Canonical Data Types & Models (`src/types/finance.ts`)

```typescript
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

// Derived Analytical Models
export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number; // percentage, e.g. 81.67
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
```

---

## 3. Exact Initial Mock Dataset Matching R2 Specifications

To satisfy all acceptance criteria in R2, the initial state must mathematically evaluate to:
- **Total Balance**: ₹24,500
- **Total Income**: ₹30,000
- **Total Expenses**: ₹5,500
- **Savings**: ₹24,500 (Income - Expenses = ₹30,000 - ₹5,500 = ₹24,500)
- **Monthly Overview Data**: Jul, Aug, Sep historical comparison
- **Split Bills Quick Card**: "You are owed ₹200"

### 3.1 Transactions Initial Mock Data
```typescript
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Income: ₹30,000
  {
    id: 'tx-1',
    description: 'Tech Corp Monthly Salary',
    amount: 30000,
    type: 'income',
    category: 'Income',
    date: '2026-09-01',
    notes: 'Primary monthly salary credit',
  },
  // Expenses summing to exactly ₹5,500
  // Food total: ₹2,100
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
  // Shopping total: ₹1,200
  {
    id: 'tx-4',
    description: 'Myntra Autumn Apparel & Sneakers',
    amount: 1200,
    type: 'expense',
    category: 'Shopping',
    date: '2026-09-12',
  },
  // Travel total: ₹750
  {
    id: 'tx-5',
    description: 'Uber Premier Airport Ride',
    amount: 750,
    type: 'expense',
    category: 'Travel',
    date: '2026-09-15',
  },
  // Bills total: ₹999
  {
    id: 'tx-6',
    description: 'Airtel Fiber Broadband Bill',
    amount: 999,
    type: 'expense',
    category: 'Bills',
    date: '2026-09-05',
  },
  // Entertainment total: ₹451
  {
    id: 'tx-7',
    description: 'Netflix 4K Ultra Subscription',
    amount: 451,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-09-08',
  },
];
```

**Verification Math Check**:
- Income = `₹30,000`
- Expenses = `₹1,450 + ₹650 + ₹1,200 + ₹750 + ₹999 + ₹451 = ₹5,500.00`
- Balance = `₹30,000 - ₹5,500 = ₹24,500.00`
- Savings = `₹24,500.00`
- Savings Rate = `(24,500 / 30,000) * 100 = 81.67%`
- Category breakdown for Donut Chart center label: `"₹5,500 Total Spent"`:
  * Food: ₹2,100 (38.18%)
  * Shopping: ₹1,200 (21.82%)
  * Bills: ₹999 (18.16%)
  * Travel: ₹750 (13.64%)
  * Entertainment: ₹451 (8.20%)
  * Total = ₹5,500 (100.00%)

### 3.2 Monthly Overview Historical Data (Jul, Aug, Sep)
```typescript
export const INITIAL_MONTHLY_DATA: MonthlyOverviewPoint[] = [
  { month: 'Jul', income: 28000, expenses: 6200, savings: 21800 },
  { month: 'Aug', income: 28000, expenses: 5800, savings: 22200 },
  { month: 'Sep', income: 30000, expenses: 5500, savings: 24500 },
];
```

### 3.3 Split Bills Initial Mock Data ("You are owed ₹200")
```typescript
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
```

**Verification Math Check for Split Bills**:
- Group `grp-1`:
  - Total expense = ₹600, paid by `You`.
  - Initial shares: You: ₹200, Rahul: ₹200, Priya: ₹200.
  - Before settlement: Rahul owes You ₹200; Priya owes You ₹200.
  - Settlement: Priya pays You ₹200.
  - Priya net balance = `paid (₹0 + ₹200) - share (₹200) = ₹0` (Settled up!).
  - Rahul net balance = `paid (₹0) - share (₹200) = -₹200` (Rahul owes ₹200).
  - You net balance = `paid (₹600) - received (₹200) - share (₹200) = +₹200` (You are owed ₹200).
- Total You Owe = `₹0`.
- Total Others Owe You = `₹200`.
- Split Bills quick card on Dashboard displays: **"You are owed ₹200"**!

---

## 4. Calculation Engine Algorithms & Formulas

### 4.1 Financial Calculation Engine (`src/utils/financeCalculations.ts`)
```typescript
export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpenses += tx.amount;
    }
  }

  const totalBalance = totalIncome - totalExpenses;
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savings,
    savingsRate: Math.round(savingsRate * 10) / 10, // 1 decimal place e.g. 81.7%
  };
}

export function calculateCategorySpending(transactions: Transaction[]): CategorySpending[] {
  const expenseMap: Record<string, number> = {};
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      expenseMap[tx.category] = (expenseMap[tx.category] || 0) + tx.amount;
      totalExpense += tx.amount;
    }
  }

  const categoryColors: Record<string, string> = {
    Food: '#F59E0B',         // Amber 500
    Shopping: '#EC4899',     // Pink 500
    Travel: '#3B82F6',       // Blue 500
    Bills: '#8B5CF6',        // Purple 500
    Entertainment: '#10B981',// Emerald 500
    Other: '#64748B',        // Slate 500
  };

  return Object.entries(expenseMap).map(([category, amount]) => ({
    category: category as TransactionCategory,
    amount,
    percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0,
    color: categoryColors[category] || '#94A3B8',
  }));
}
```

### 4.2 Auto-Categorization Keyword Engine (`src/utils/autoCategorization.ts`)
Per Requirement R3, keyword matching rules are exact:
- `Food`: `['burger', 'pizza', 'swiggy', 'zomato', 'cafe', 'lunch', 'dinner']`
- `Travel`: `['uber', 'ola', 'cab', 'metro', 'petrol', 'fuel']`
- `Shopping`: `['amazon', 'flipkart', 'myntra', 'shoes', 'clothes']`
- `Bills`: `['electricity', 'wifi', 'recharge', 'bill', 'rent']`
- `Entertainment`: `['movie', 'netflix', 'cinema', 'spotify']`
- `Income`: `['salary', 'stipend', 'freelance', 'bonus']`

```typescript
export const CATEGORY_KEYWORDS: Record<TransactionCategory, string[]> = {
  Food: ['burger', 'pizza', 'swiggy', 'zomato', 'cafe', 'lunch', 'dinner'],
  Travel: ['uber', 'ola', 'cab', 'metro', 'petrol', 'fuel'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'shoes', 'clothes'],
  Bills: ['electricity', 'wifi', 'recharge', 'bill', 'rent'],
  Entertainment: ['movie', 'netflix', 'cinema', 'spotify'],
  Income: ['salary', 'stipend', 'freelance', 'bonus'],
  Other: [],
};

export function detectCategoryFromKeyword(description: string): {
  category: TransactionCategory;
  matchedKeyword?: string;
} {
  if (!description || typeof description !== 'string') {
    return { category: 'Other' };
  }

  const normalized = description.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      // Word boundary or substring matching
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalized) || normalized.includes(keyword)) {
        return {
          category: category as TransactionCategory,
          matchedKeyword: keyword,
        };
      }
    }
  }

  return { category: 'Other' };
}
```

### 4.3 Split Ledger Calculation Engine (`src/utils/splitLedger.ts`)
```typescript
export function calculateGroupBalances(
  members: string[],
  expenses: SplitExpense[],
  settlements: Settlement[]
): MemberBalance[] {
  const paidMap: Record<string, number> = {};
  const shareMap: Record<string, number> = {};

  for (const m of members) {
    paidMap[m] = 0;
    shareMap[m] = 0;
  }

  // Aggregate expenses
  for (const exp of expenses) {
    paidMap[exp.paidBy] = (paidMap[exp.paidBy] || 0) + exp.amount;
    for (const alloc of exp.allocations) {
      shareMap[alloc.member] = (shareMap[alloc.member] || 0) + alloc.amount;
    }
  }

  // Aggregate settlements
  // If fromMember pays toMember:
  // fromMember's net paid increases by amount; toMember receives amount (net paid decreases or share increases)
  for (const set of settlements) {
    paidMap[set.fromMember] = (paidMap[set.fromMember] || 0) + set.amount;
    paidMap[set.toMember] = (paidMap[set.toMember] || 0) - set.amount;
  }

  return members.map((member) => {
    const paid = paidMap[member] || 0;
    const share = shareMap[member] || 0;
    const netBalance = Math.round((paid - share) * 100) / 100;
    return {
      member,
      paid,
      share,
      netBalance,
    };
  });
}

export function calculateSplitLedgerSummary(
  groups: SplitGroup[],
  expenses: SplitExpense[],
  settlements: Settlement[]
): SplitLedgerSummary {
  let totalYouOwe = 0;
  let totalOthersOweYou = 0;
  const groupBalances: Record<string, MemberBalance[]> = {};

  for (const group of groups) {
    const groupExpenses = expenses.filter((e) => e.groupId === group.id);
    const groupSettlements = settlements.filter((s) => s.groupId === group.id);
    const balances = calculateGroupBalances(group.members, groupExpenses, groupSettlements);
    groupBalances[group.id] = balances;

    const youBalance = balances.find((b) => b.member === 'You');
    if (youBalance) {
      if (youBalance.netBalance > 0) {
        totalOthersOweYou += youBalance.netBalance;
      } else if (youBalance.netBalance < 0) {
        totalYouOwe += Math.abs(youBalance.netBalance);
      }
    }
  }

  return {
    totalYouOwe: Math.round(totalYouOwe * 100) / 100,
    totalOthersOweYou: Math.round(totalOthersOweYou * 100) / 100,
    netBalance: Math.round((totalOthersOweYou - totalYouOwe) * 100) / 100,
    groupBalances,
  };
}

export function calculateEqualSplit(amount: number, members: string[]): SplitAllocation[] {
  if (members.length === 0) return [];
  const baseShare = Math.floor((amount / members.length) * 100) / 100;
  const remainder = Math.round((amount - baseShare * members.length) * 100) / 100;

  return members.map((member, index) => ({
    member,
    amount: index === 0 ? Math.round((baseShare + remainder) * 100) / 100 : baseShare,
  }));
}
```

---

## 5. State Management Architecture (`FinanceContext`)

### 5.1 Context State & Action Interfaces (`src/context/FinanceContext.tsx`)
```typescript
export interface FinanceContextType {
  // State
  transactions: Transaction[];
  splitGroups: SplitGroup[];
  splitExpenses: SplitExpense[];
  settlements: Settlement[];
  activeTab: TabType;
  selectedGroupId: string | null;

  // Computed Summaries
  summary: FinancialSummary;
  categorySpending: CategorySpending[];
  monthlyData: MonthlyOverviewPoint[];
  splitSummary: SplitLedgerSummary;

  // Modals visibility state
  isAddTransactionOpen: boolean;
  isCreateGroupOpen: boolean;
  isAddSplitExpenseOpen: boolean;
  isSettleUpOpen: boolean;

  // Actions
  setActiveTab: (tab: TabType) => void;
  setSelectedGroupId: (id: string | null) => void;
  setAddTransactionOpen: (open: boolean) => void;
  setCreateGroupOpen: (open: boolean) => void;
  setAddSplitExpenseOpen: (open: boolean) => void;
  setSettleUpOpen: (open: boolean) => void;

  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  createSplitGroup: (group: Omit<SplitGroup, 'id' | 'createdAt'>) => void;
  addSplitExpense: (expense: Omit<SplitExpense, 'id'>) => void;
  recordSettlement: (settlement: Omit<Settlement, 'id'>) => void;
  resetToDefaultData: () => void;
}
```

### 5.2 Storage & Real-Time Sync Strategy
1. **Local Storage Hydration**: Load from `localStorage.getItem('pfi_data_v1')`. If null or invalid, hydrate with canonical `INITIAL_TRANSACTIONS`, `INITIAL_GROUPS`, `INITIAL_SPLIT_EXPENSES`, and `INITIAL_SETTLEMENTS`.
2. **Auto-Persist**: `useEffect` persists updated state to `localStorage` on any state modification.
3. **Pure Derivation**: `summary`, `categorySpending`, and `splitSummary` are derived via `useMemo` from raw arrays, guaranteeing zero stale state across views.
4. **Custom Hook**: `useFinance()` throws descriptive error if used outside `FinanceProvider`.

---

## 6. Automated Test Harness Architecture (Vitest)

### 6.1 Test Directory Structure
```
src/
└── utils/
    ├── __tests__/
    │   ├── financeCalculations.test.ts  # Verification 1: Balance, Income, Expense, Savings
    │   ├── autoCategorization.test.ts   # Verification 2: Keyword auto-categorization
    │   └── splitLedger.test.ts          # Verification 3: Split math, equal/custom & settlements
```

### 6.2 Test Specification Plans

#### Suite 1: `financeCalculations.test.ts`
- **TC-FIN-01**: Computes exact initial mock data values:
  - Input: `INITIAL_TRANSACTIONS`
  - Assert `summary.totalIncome === 30000`
  - Assert `summary.totalExpenses === 5500`
  - Assert `summary.totalBalance === 24500`
  - Assert `summary.savings === 24500`
  - Assert `summary.savingsRate === 81.7`
- **TC-FIN-02**: Empty array returns all 0 values.
- **TC-FIN-03**: Incremental transaction: adding `amount: 1000, type: 'expense'` reduces balance to `23500` and increases total expenses to `6500`.
- **TC-FIN-04**: Category spending aggregation sums up to total expense and calculates exact percentages.

#### Suite 2: `autoCategorization.test.ts`
- **TC-CAT-01**: Detects Food keywords:
  - `'swiggy order'`, `'Dominos pizza'`, `'burger king'`, `'cafe coffee day'`, `'team lunch'`, `'Sunday dinner'` -> `'Food'`
- **TC-CAT-02**: Detects Travel keywords:
  - `'Uber ride'`, `'ola airport'`, `'cab fare'`, `'metro card recharge'`, `'petrol pump'`, `'fuel'` -> `'Travel'`
- **TC-CAT-03**: Detects Shopping keywords:
  - `'Amazon order'`, `'flipkart sale'`, `'myntra clothes'`, `'running shoes'`, `'party clothes'` -> `'Shopping'`
- **TC-CAT-04**: Detects Bills keywords:
  - `'electricity bill'`, `'wifi router'`, `'phone recharge'`, `'monthly bill'`, `'house rent'` -> `'Bills'`
- **TC-CAT-05**: Detects Entertainment keywords:
  - `'cinema tickets'`, `'netflix 4k'`, `'movie night'`, `'spotify family'` -> `'Entertainment'`
- **TC-CAT-06**: Detects Income keywords:
  - `'Monthly salary'`, `'internship stipend'`, `'freelance project'`, `'yearly bonus'` -> `'Income'`
- **TC-CAT-07**: Case-insensitive and edge-cases:
  - `'SWIGGY GOURMET'`, `'uber'`, `'MyNtRa'`
- **TC-CAT-08**: Unmatched keyword falls back to `'Other'`.

#### Suite 3: `splitLedger.test.ts`
- **TC-SPLIT-01**: Equal split allocation handles clean divisions:
  - `calculateEqualSplit(600, ['You', 'Rahul', 'Priya'])` yields `[{ member: 'You', amount: 200 }, { member: 'Rahul', amount: 200 }, { member: 'Priya', amount: 200 }]`.
- **TC-SPLIT-02**: Equal split allocation handles recurring remainders without floating point loss:
  - `calculateEqualSplit(100, ['A', 'B', 'C'])` yields total exactly `100.00` (`[33.34, 33.33, 33.33]`).
- **TC-SPLIT-03**: Initial split state net balance calculation:
  - Expense `600` paid by `'You'`, settlement `200` paid by `'Priya'` to `'You'`.
  - Assert `totalOthersOweYou === 200`
  - Assert `totalYouOwe === 0`
  - Assert Rahul owes `200`
  - Assert Priya is settled (`netBalance === 0`)
- **TC-SPLIT-04**: Conservation invariant:
  - `sum(member.netBalance for all members) === 0` must hold across any combination of expenses and settlements.
- **TC-SPLIT-05**: Multi-settlement and custom split allocations:
  - Unequal shares correctly reflected in individual debt balances.

---

## 7. Downstream Implementation Milestones

1. **Milestone 1**: Vite + React + TypeScript + Tailwind setup, `src/types/finance.ts`, utility calculation engines (`financeCalculations.ts`, `autoCategorization.ts`, `splitLedger.ts`), `INITIAL_DATA` constants, and core `FinanceContext.tsx`.
2. **Milestone 2**: Application Shell (Sidebar, Header, Layout) + Dashboard Screen (Summary Cards, Donut Chart, Monthly Overview Bar Chart, Quick Actions, Recent Transactions, Split Bills Quick Card, Recent Insights).
3. **Milestone 3**: Dedicated Transactions Screen (Live search, Category filter dropdown, Dual-column layout, Add Transaction Modal with Keyword Auto-Categorization).
4. **Milestone 4**: Dedicated Financial Analytics Screen (Trend badges, category progress bars, monthly comparison, insights highlight banner).
5. **Milestone 5**: Split Bills Screen (Group ledger, equal/custom split modals, settlement engine, activity timeline).
6. **Milestone 6**: Vitest test harness setup and test suite execution verifying calculations, keyword categorization, and split ledger math.
