# Project: Personal Finance Intelligence (Production-Ready React Single-Page Application)

## Architecture
- **Tech Stack**: React 18, Vite 5, TypeScript 5, Tailwind CSS 3.4, Lucide React, Recharts 2.12, Vitest 1.6 with `@testing-library/react` and `jsdom`.
- **Aesthetic**: Modern fintech aesthetic with soft light gray-blue background (`#F8FAFC`), crisp white cards with rounded-2xl (`rounded-2xl`), subtle borders (`border-slate-100`), soft shadows (`shadow-sm`), and clean typography.
- **State Architecture**: Centralized reactive state via `FinanceContext` in `src/context/FinanceContext.tsx`. Manages transactions, split groups, split expenses, settlements, active views, and modal states. Backed by pure utility calculation engines with local storage persistence and mock data fallback.
- **Navigation & Routing**: Clean client-side tab routing without full page reloads. Fixed left sidebar on desktop/tablet with bottom bar/drawer responsiveness, topbar with dynamic time-of-day greeting, user avatar, and live date badge.
- **Mathematical Engines**: Isolated pure TypeScript modules for financial KPI calculations (`calculations.ts`), keyword auto-categorization (`autoCategorize.ts`), and split bill group ledger math (`splitLedger.ts`).

## Code Layout
```
personal-finance-intelligence/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts                 # Canonical TypeScript models and interfaces
│   ├── context/
│   │   └── FinanceContext.tsx       # Centralized shared state & actions provider
│   ├── data/
│   │   └── mockData.ts              # Spec-compliant initial seed data (₹24,500, ₹30,000, ₹5,500, ₹200)
│   ├── utils/
│   │   ├── calculations.ts          # Pure finance calculation engine (KPIs, MoM, categories)
│   │   ├── autoCategorize.ts        # Keyword auto-detection engine with override logic
│   │   ├── splitLedger.ts           # Group expense ledger & net balance calculation engine
│   │   └── formatters.ts            # Indian Rupee (₹) and date formatters
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Fixed left navigation bar with tab switching
│   │   │   ├── Header.tsx           # Dynamic greeting, user profile, date badge, quick add
│   │   │   └── Footer.tsx           # Footer with copyright and fintech branding
│   │   ├── dashboard/
│   │   │   ├── SummaryCards.tsx     # 4 financial summary cards with icon pills
│   │   │   ├── CategoryDonut.tsx    # Recharts Donut chart with custom center SVG label
│   │   │   ├── MonthlyBarChart.tsx  # Grouped bar chart (Income vs Expenses for Jul, Aug, Sep)
│   │   │   ├── QuickActions.tsx     # Action shortcuts (add transaction, split bill, analytics)
│   │   │   ├── RecentTransactions.tsx # Recent transactions table with category pills
│   │   │   ├── SplitQuickCard.tsx   # Owed balance ("You are owed ₹200") & group summary
│   │   │   └── InsightsCard.tsx     # Dynamic financial intelligence tips
│   │   ├── transactions/
│   │   │   ├── TransactionTable.tsx # Live search & filterable transactions table
│   │   │   ├── TransactionSummary.tsx # Quick financial summary and category breakdown
│   │   │   └── AddTransactionModal.tsx # Modal with real-time keyword auto-categorization
│   │   ├── analytics/
│   │   │   ├── MetricCards.tsx      # MoM trend percentage badges (+/- changes)
│   │   │   ├── CategoryProgress.tsx # Horizontal category progress bars with percentage widths
│   │   │   └── InsightsBanner.tsx   # Top spending insights highlight banner
│   │   ├── split/
│   │   │   ├── GroupList.tsx        # Split bills groups list with member avatars
│   │   │   ├── GroupMetrics.tsx     # Group metrics cards (Total groups, Owed, Owe)
│   │   │   ├── GroupDetail.tsx      # Active group expense ledger & net balance breakdown
│   │   │   ├── CreateGroupModal.tsx # Modal to create group with member names
│   │   │   ├── AddExpenseModal.tsx  # Modal for equal split or custom per-member allocations
│   │   │   └── SettleModal.tsx      # Modal to record settlement payments
│   │   └── common/
│   │       ├── Modal.tsx            # Accessible dialog modal wrapper
│   │       └── Badge.tsx            # Category and status pill components
│   └── test/
│       ├── setup.ts                 # Vitest jsdom setup and ResizeObserver polyfill
│       ├── calculations.test.ts     # Unit tests for finance math and KPIs
│       ├── autoCategorize.test.ts   # Unit tests for keyword detection rules
│       ├── splitLedger.test.ts      # Unit tests for split bills ledger math
│       └── e2e.test.tsx             # Integration and E2E component flow tests
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Greenfield Build Config | Vite, React 18, TypeScript, Tailwind, Lucide, Recharts, Vitest setup | M1 | R1, Specs |
| 2 | Canonical Data Models | Types for Transaction, SplitGroup, SplitExpense, Settlement, Categories | M1 | R1, R5 |
| 3 | Core Calculation Engine | Pure functions for Balance, Total Income, Total Expenses, Savings, MoM | M1 | R1, R2, R4 |
| 4 | Auto-Categorization Engine | Pure regex-based keyword detection for 6 categories with manual override | M1 | R3 |
| 5 | Split Ledger Math Engine | Pure net balance engine ((Paid - Owed) + (Sent - Received)), pairwise debts | M1 | R5 |
| 6 | Spec-Compliant Mock Dataset | Initial data: Balance ₹24,500, Income ₹30,000, Expense ₹5,500, Owed ₹200 | M1 | R2, R5 |
| 7 | FinanceContext Reactive Store | Central React context managing transactions, groups, settlements | M1 | R1 |
| 8 | Unit Test Verification Suite | Vitest tests for calculations, keyword detection, split bills math | M1 | Verification |
| 9 | Fixed Left Sidebar | Navigation links (Dashboard, Transactions, Analytics, Split Bills, Settings) | M2 | R1 |
| 10 | Dynamic Header Bar | Time-based greeting, user avatar pill, live date badge, quick add button | M2 | R1 |
| 11 | Client-Side Tab Router | Instant view switching without full page reloads | M2 | R1 |
| 12 | Top 4 Financial Summary Cards | Total Balance (₹24,500), Income (₹30,000), Expenses (₹5,500), Savings (₹24,500) | M2 | R2 |
| 13 | Spending by Category Donut | Recharts Donut with custom center SVG label ("₹5,500 Total Spent") & legend | M2 | R2 |
| 14 | Monthly Overview Bar Chart | Grouped Recharts bar chart (Income vs Expenses for Jul, Aug, Sep) | M2 | R2 |
| 15 | Quick Actions Card | Shortcuts to Add Transaction, Split Bill, Analytics, Set Budget | M2 | R2 |
| 16 | Recent Transactions Table | Table with category icons, category pills, formatted colored amounts, badges | M2 | R2 |
| 17 | Split Bills Quick Card | Displaying owed balance ("You are owed ₹200") and active group summary | M2 | R2 |
| 18 | Recent Insights Card | Dynamic financial intelligence bullet tips | M2 | R2 |
| 19 | Responsive Layout Shell | Tablet & mobile responsive navigation and card grids | M2 | Acceptance |
| 20 | Footer Branding | Modern fintech footer with copyright and tagline | M2 | R2 |
| 21 | Transactions Screen Layout | Dual-column layout: main table alongside financial summary card | M3 | R3 |
| 22 | Live Search Filtering | Instant filtering across transaction description and amount | M3 | R3 |
| 23 | Category & Type Dropdown Filters | Filter transactions by category (Food, Travel, etc.) and type (Income/Expense) | M3 | R3 |
| 24 | Add Transaction Modal | Modal with form fields for amount, type, date, description, category | M3 | R3 |
| 25 | Real-Time Keyword Auto-Detection | Auto-populates category when user types keywords (swiggy->Food, uber->Travel, etc.) | M3 | R3 |
| 26 | Manual Category Override | Explicit category selection overrides auto-detection | M3 | R3 |
| 27 | Edit Transaction Action | Edit existing transaction with prefilled form and live state update | M3 | R3 |
| 28 | Delete Transaction Action | Remove transaction with instant balance and chart recalculation | M3 | R3 |
| 29 | Transactions Financial Summary | Side card showing current filtered totals and category breakdown | M3 | R3 |
| 30 | Metric Overview Cards | Analytics cards with Month-over-Month (MoM) trend badges (+/- %) | M4 | R4 |
| 31 | Analytics Donut & Bar Charts | Visual breakdown with category donut and monthly comparison bar chart | M4 | R4 |
| 32 | Category Spending Progress Bars | Horizontal progress bars with percentage widths and budget comparisons | M4 | R4 |
| 33 | Top Spending Insights Banner | Highlight banner with highest expense category, monthly savings, budget health | M4 | R4 |
| 34 | Time Range Filters | Time frame toggles (This Month, Last 3 Months, All Time) in Analytics | M4 | R4 |
| 35 | Split Bills Ledger Interface | Group management interface with member text names without login accounts | M5 | R5 |
| 36 | Split Bills Metric Cards | Total Groups, Total Amount You Owe, Total Amount Others Owe You, Recent Expenses | M5 | R5 |
| 37 | Create Group Modal | Interactive modal to create groups and assign member names | M5 | R5 |
| 38 | Log Group Expense Modal | Modal with payer selector, amount, and split mode (Equal Split vs Custom) | M5 | R5 |
| 39 | Equal Split Allocation | Evenly distributes expense across selected group members with remainder rounding | M5 | R5 |
| 40 | Custom Per-Member Allocation | Allows specifying custom amounts per member with total balance validation | M5 | R5 |
| 41 | Record Settlement Modal | Record payment between two members with note and date | M5 | R5 |
| 42 | Net Balance Calculation Engine | Computes net balances ((Paid - Owed) + (Sent - Received)) for each member | M5 | R5 |
| 43 | Pairwise Debt Resolution Engine | Computes simplified "Who owes whom how much" breakdown | M5 | R5 |
| 44 | Activity Timeline Log | Chronological timeline of expenses and settlements in the group | M5 | R5 |
| 45 | Member Avatars & Status Badges | Display member pills with color badges and individual balance status | M5 | R5 |
| 46 | Real-time Synchronization | Instant state updates across Dashboard, Transactions, Analytics, and Split Bills | M1-M5 | Acceptance |
| 47 | Modern Fintech Styling Polish | #F8FAFC background, rounded-2xl cards, border-slate-100, shadow-sm | M1-M5 | Acceptance |
| 48 | Recharts SVG & Tooltip Polish | Custom center SVG labels, theme colors, tooltips with currency formatting | M2, M4 | Acceptance |
| 49 | Production Build Pipeline | `npm run build` succeeds with zero TypeScript and bundle errors | M6 | Verification |
| 50 | Automated E2E Test Suite | Vitest tests across Tiers 1-4 verifying all user journeys and edge cases | M6 | Verification |
| 51 | Adversarial Hardening (Tier 5) | Stress testing boundary conditions, empty states, and rapid state mutations | M6 | Verification |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Core Foundation & Engines | Scaffolding, TypeScript types, calculations, auto-categorize, split ledger math, mock data, FinanceContext, initial test suites | none | PLANNED |
| M2 | App Shell & Dashboard Screen | Layout (Sidebar, Header, Footer), Client router, 4 KPI cards, Recharts Donut & Grouped Bar, Quick Actions, Recent Transactions, Split quick card, Insights | M1 | PLANNED |
| M3 | Transactions & Auto-Categorization | Dual-column view, Live search, category filters, Add/Edit/Delete modals, keyword auto-categorization with manual override | M1, M2 | PLANNED |
| M4 | Financial Analytics Screen | Metric cards with MoM trend badges, category progress bars, top spending insights banner, interactive charts | M1, M2 | PLANNED |
| M5 | Split Bills Module | Group ledger, group metrics, Create Group modal, Add Expense modal (equal & custom), Settle Up modal, Net balance engine, activity timeline | M1, M2 | PLANNED |
| M6 | E2E Testing Track & Final Verification | Full opaque-box E2E test suite (Tiers 1-4), adversarial stress testing (Tier 5), 100% test pass, clean production build | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts

### FinanceContext (`src/context/FinanceContext.tsx`)
```typescript
interface FinanceContextType {
  // State
  transactions: Transaction[];
  splitGroups: SplitGroup[];
  settlements: Settlement[];
  activeTab: 'dashboard' | 'transactions' | 'analytics' | 'split-bills' | 'settings';
  
  // Navigation
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'analytics' | 'split-bills' | 'settings') => void;
  
  // Transaction Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Split Bills Actions
  createGroup: (name: string, members: string[]) => string;
  addSplitExpense: (groupId: string, expense: Omit<SplitExpense, 'id'>) => void;
  recordSettlement: (groupId: string, settlement: Omit<Settlement, 'id'>) => void;
  
  // Derived Selectors
  financialSummary: FinancialSummary; // totalBalance, totalIncome, totalExpenses, savings, savingsRate
  categoryBreakdown: CategorySpending[];
  monthlyOverview: MonthlyOverviewPoint[];
  splitLedgerSummary: SplitLedgerSummary; // totalYouOwe, totalOthersOweYou, totalGroups
}
```

### Auto-Categorization Contract (`src/utils/autoCategorize.ts`)
```typescript
export function autoCategorize(description: string): { category: TransactionCategory; matchedKeyword: string | null };
```

### Split Ledger Contract (`src/utils/splitLedger.ts`)
```typescript
export function calculateMemberBalances(group: SplitGroup): Record<string, MemberBalance>;
export function calculateSimplifiedDebts(group: SplitGroup): Array<{ from: string; to: string; amount: number }>;
export function calculateOverallSplitSummary(groups: SplitGroup[], currentUser: string): SplitLedgerSummary;
```
