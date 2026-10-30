# Specification Mining & Feature Inventory Analysis

**Project**: Personal Finance Intelligence (Personal Expense Tracker React SPA)  
**Spec Miner**: `survey_spec_miner_1`  
**Authoritative Source**: `ORIGINAL_REQUEST.md` (Integrity Mode: development)  
**Date**: 2026-10-30  

---

## 1. Executive Summary

This document establishes the exhaustive specification mining and feature inventory for **Personal Finance Intelligence**, a production-ready, client-side React (Vite) single-page application built with Tailwind CSS, Lucide React icons, and Recharts.

The application serves as an integrated personal wealth intelligence dashboard, granular transaction ledger with keyword-based auto-categorization, financial analytics visualization suite, and a multi-member group split bill engine with automated balance settlement math.

The specification source is the authoritative `ORIGINAL_REQUEST.md`. Every functional and non-functional requirement across R1–R5, verification resources, and acceptance criteria has been systematically mined, analyzed, and mapped.

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| F01 | R1: Core Architecture | Fixed Left Sidebar Navigation | Persistent navigation bar providing access to all 5 application views (Dashboard, Transactions, Analytics, Split Bills, Settings) with active state indicators | User click on navigation item | View state update, active tab visual highlight (`bg-indigo-50 text-indigo-600`) | Defaults to 'dashboard' if invalid route | `ORIGINAL_REQUEST.md` R1 |
| F02 | R1: Core Architecture | Top Navigation Bar | Header displaying dynamic time-based greeting, current date badge, and user avatar initials | System time / Date object | Formatted greeting ("Good morning / afternoon / evening"), date badge ("Fri, 30 Oct 2026"), avatar pill | Graceful fallback to generic "Welcome back" if time unavailable | `ORIGINAL_REQUEST.md` R1 |
| F03 | R1: Core Architecture | Centralized Shared State (`FinanceContext`) | React Context managing `transactions`, `splitGroups`, `settlements`, `categories`, and `userProfile` with synchronous reactivity across views | State action dispatches (add/edit/delete transaction, create group, log expense, settle) | React Context Provider broadcasting updated state to all consuming views | Throws error if hook used outside `FinanceProvider` | `ORIGINAL_REQUEST.md` R1, Acceptance Criteria |
| F04 | R1: Core Architecture | Client-Side View Router | Seamless tab-based routing without full page reloads, keeping in-memory state completely synchronized | Selected tab ID string ('dashboard' \| 'transactions' \| 'analytics' \| 'split-bills' \| 'settings') | Active view rendered inside responsive main content container | Invalid tab falls back to 'dashboard' | `ORIGINAL_REQUEST.md` R1 |
| F05 | R1: Core Architecture | Initial Mock Data Hydration | Pre-loaded realistic financial state fulfilling spec numbers (₹24,500 balance, ₹30,000 income, ₹5,500 expenses, ₹200 owed) | LocalStorage or fallback constant seed data | Fully populated state with 10+ realistic transactions across 3 months, 2 split groups | Corrupted storage resets to pristine mock dataset | `ORIGINAL_REQUEST.md` R2, R5, Acceptance Criteria |
| F06 | R1: Core Architecture | LocalStorage Persistence | Synchronizes state changes to browser `localStorage` to ensure persistence across reloads | State changes in `FinanceContext` | Serialized JSON stored in `localStorage` | Storage quota exceeded falls back to in-memory state with console warning | `ORIGINAL_REQUEST.md` R1 |
| F07 | R2: Dashboard | 4 Financial Metric Summary Cards | Metric cards showing Total Balance (₹24,500), Total Income (₹30,000), Total Expenses (₹5,500), and Net Savings (₹24,500) with colored icon pills | Array of transactions | 4 formatted currency cards with icon badges and color accents | Empty transactions show ₹0 with neutral badge | `ORIGINAL_REQUEST.md` R2 |
| F08 | R2: Dashboard | Spending by Category Donut Chart | Recharts Pie/Donut chart displaying expense distribution with custom SVG center text ("₹5,500 Total Spent") | Filtered expense transactions grouped by category | Interactive Donut chart with category colors and central label | If total expenses == 0, renders empty state placeholder | `ORIGINAL_REQUEST.md` R2 |
| F09 | R2: Dashboard | Donut Chart Time Filter | Time range selector (This Month, Last 30 Days, All Time) dynamically filtering category spending | Filter selection dropdown or pill buttons | Re-calculated category breakdown and updated donut chart | Unrecognized filter defaults to 'This Month' | `ORIGINAL_REQUEST.md` R2 |
| F10 | R2: Dashboard | Donut Chart Category Legend | Category breakdown listing color dot, category name, total amount, and percentage share | Category spending totals | Formatted list/legend alongside or below donut chart | Hidden if no expenses exist | `ORIGINAL_REQUEST.md` R2 |
| F11 | R2: Dashboard | Monthly Overview Grouped Bar Chart | Recharts BarChart comparing Income vs Expenses side-by-side across recent months (Jul, Aug, Sep) | Monthly aggregated income and expense data | Grouped 2-bar visual comparison with tooltips and axis formatted in ₹ | Missing month data renders 0-height bars | `ORIGINAL_REQUEST.md` R2 |
| F12 | R2: Dashboard | Quick Actions Card | Action buttons for Add Transaction, Create Split Bill, View Analytics, and Set Budgets | User button click | Opens Add Transaction Modal, opens Create Group Modal, switches view to Analytics, opens Budget Modal | Non-blocking modals / tab switches | `ORIGINAL_REQUEST.md` R2 |
| F13 | R2: Dashboard | Recent Transactions Table | Table displaying the 5 most recent transactions with Date, Description with Category Icon, Category Pill, Formatted Amount (+/- with color), and Type Badge | Most recent transactions slice | Paginated or truncated table with clean status styling | Displays "No recent transactions" empty illustration if list is empty | `ORIGINAL_REQUEST.md` R2 |
| F14 | R2: Dashboard | Split Bills Quick Card | Summary card showing user's net split bill standing ("You are owed ₹200") and active group list | Split groups and settlements data | Quick status banner, group avatar badges, and "Open Split Bills" CTA button | If balance is 0, displays "All settled up" | `ORIGINAL_REQUEST.md` R2 |
| F15 | R2: Dashboard | Dynamic Financial Insights Card | Card presenting contextual, dynamic financial bullet tips and health insights derived from current transactions | Computed financial ratios (savings rate, top expense category, budget status) | 2–4 dynamic bullet items with icon markers | Defaults to baseline starter tips if < 3 transactions | `ORIGINAL_REQUEST.md` R2 |
| F16 | R2: Dashboard | Application Footer | Footer containing copyright notice and fintech tagline | System year | "© 2026 Personal Finance Intelligence. Smart financial tracking & split expense management." | Static layout element | `ORIGINAL_REQUEST.md` R2 |
| F17 | R3: Transactions | Dual-Column Transactions Layout | Screen structure with main searchable transaction table on the left (2/3 width) and quick financial summary sidebar on the right (1/3 width) | Screen size and transactions state | Two-column responsive grid layout | Collapses into single stacked column on mobile/tablet | `ORIGINAL_REQUEST.md` R3 |
| F18 | R3: Transactions | Real-Time Search Filtering | Instant filtering of transactions by matching query against description string or amount value | Search input text string | Filtered transaction subset matching substring | Case-insensitive; trims whitespace; no match shows empty search state | `ORIGINAL_REQUEST.md` R3 |
| F19 | R3: Transactions | Category Dropdown Filter | Dropdown filter allowing user to isolate transactions by category (All, Food, Travel, Shopping, Bills, Entertainment, Income, Other) | Selected category string | Filtered transaction list | 'All' shows all categories | `ORIGINAL_REQUEST.md` R3 |
| F20 | R3: Transactions | Type Filter & Sorting Controls | Controls to filter by transaction type (All, Income, Expense) and sort by Date (newest/oldest) or Amount (highest/lowest) | Selected type filter and sort key/order | Re-ordered and filtered transaction list | Retains filter combinations gracefully | `ORIGINAL_REQUEST.md` R3 |
| F21 | R3: Transactions | Transaction Summary Sidebar | Side panel displaying quick metrics (Total Inflow, Total Outflow, Net Balance, Category count) and mini category breakdown list | Current filtered or total transactions | Summary metric cards and vertical mini progress list | Recalculates dynamically with active filters | `ORIGINAL_REQUEST.md` R3 |
| F22 | R3: Transactions | Add Transaction Modal Dialog | Modal dialog with form fields: Description, Amount, Type (Income/Expense), Category, Date, and Notes | User input entries | Validated new transaction object appended to `transactions` state | Form validation errors for missing description, non-positive amount, invalid date | `ORIGINAL_REQUEST.md` R3 |
| F23 | R3: Transactions | Real-Time Keyword Auto-Categorization | Live keyword detection in description input that automatically infers and selects category: Food, Travel, Shopping, Bills, Entertainment, Income | Description input text `onChange` | Automatically selected Category dropdown value | Word-boundary matching; case-insensitive; ignores noise words | `ORIGINAL_REQUEST.md` R3, Acceptance Criteria |
| F24 | R3: Transactions | Auto-Categorization Manual Override | Allows user to freely change or override auto-inferred category without having it forcibly re-overridden unless description changes | User manual category selection | Locks category to user's explicit selection | Explicit selection flag prevents auto-categorizer from overwriting user choice | `ORIGINAL_REQUEST.md` R3 |
| F25 | R3: Transactions | Edit Transaction Capability | Ability to edit existing transaction fields with immediate propagation across summary metrics, charts, and tables | Transaction ID and updated fields | Replaced transaction object in state; instant UI update | Validates updated values; preserves transaction ID | `ORIGINAL_REQUEST.md` Acceptance Criteria |
| F26 | R3: Transactions | Delete Transaction Capability | Ability to delete a transaction with confirmation prompt and immediate recalculation of all metrics | Transaction ID to delete | Transaction removed from state; metrics recalculated immediately | Deletion of non-existent ID handled safely without crash | `ORIGINAL_REQUEST.md` Acceptance Criteria |
| F27 | R4: Analytics | Month-over-Month Trend Badges | Overview cards displaying percentage change (+/- %) compared to prior month for Income, Expenses, and Savings | Current month totals and previous month totals | Percentage pill badge (e.g. `+12.4% vs last month` with green/red indicator) | If prior month total == 0, displays "N/A" or "New" without division by zero | `ORIGINAL_REQUEST.md` R4 |
| F28 | R4: Analytics | Analytics Expense Donut Chart | Large interactive Recharts Pie/Donut chart with custom center text showing total expense and hovered category detail | Category-aggregated expenses | Responsive donut chart with animated segments and tooltips | Empty state with helper message if no expense data exists | `ORIGINAL_REQUEST.md` R4 |
| F29 | R4: Analytics | Analytics Grouped Monthly Bar Chart | Multi-month Recharts BarChart comparing Income vs Expense totals with legend and custom currency tooltip | Monthly aggregated income and expense series | Responsive grouped bar chart | Renders minimum 3-month timeline (e.g. Jul, Aug, Sep) | `ORIGINAL_REQUEST.md` R4 |
| F30 | R4: Analytics | Horizontal Category Spending Progress Bars | Progress bar visual list showing each category's spending amount, share percentage, and proportional colored progress bar | Category spending totals | Progress bar rows sorted descending by spend percentage | Progress width clamped to `[0, 100]%` | `ORIGINAL_REQUEST.md` R4 |
| F31 | R4: Analytics | Top Spending Insights Banner | Highlight banner featuring 3 icon summary cards: Highest Expense Category, Monthly Savings Rate, and Budget Health Indicator | Computed expense statistics | 3 styled highlight cards with badges and advice | Renders healthy default metrics if expenses are zero | `ORIGINAL_REQUEST.md` R4 |
| F32 | R4: Analytics | Average Daily Spending Metric | Analytical card computing average expense per day for the current month | Total monthly expenses / days elapsed | Formatted currency amount (e.g. ₹183 / day) | Days elapsed clamped to minimum 1 to avoid zero division | `ORIGINAL_REQUEST.md` R4 |
| F33 | R5: Split Bills | Single-User Group Expense Ledger Model | Group expense ledger where members are simple text names without requiring external authentication or user invites | Text strings for member names (e.g. "You", "Rahul", "Priya", "Amit") | In-memory member list per group with "You" designated as primary self-identity | Rejects empty or duplicate member names in group | `ORIGINAL_REQUEST.md` R5 |
| F34 | R5: Split Bills | Group Metric Cards | Top metric cards displaying Total Groups count, Total Amount You Owe, Total Amount Others Owe You, and Total Group Expenses | State of all split groups and settlements | 4 styled stat cards with colored badges and ₹ formatting | Shows ₹0 and clean zero-state when all balances settled | `ORIGINAL_REQUEST.md` R5 |
| F35 | R5: Split Bills | Create Group Modal | Modal dialog to create new group with Group Name, Category icon/tag, and comma-separated/tag-based member names | Group name string, member name array | New group added to `splitGroups` state | Validates group name (min 2 chars), requires at least 2 members (including "You") | `ORIGINAL_REQUEST.md` R5 |
| F36 | R5: Split Bills | Group Switcher & Detail View | Group list / tab bar allowing selection of active group to inspect its members, expenses, balances, and timeline | Selected group ID | Displays group header, member cards, expense list, and settlement options | Invalid group ID falls back to first available group | `ORIGINAL_REQUEST.md` R5 |
| F37 | R5: Split Bills | Log Group Expense Modal | Modal to log group expense with Title, Total Amount, Paid By member, Split Method, and participant inclusion | Expense title, amount, payer, split type ('equal' \| 'custom'), allocations | Expense recorded in group; member balances recomputed in real time | Validates amount > 0, at least 1 participant, custom allocations must sum to total | `ORIGINAL_REQUEST.md` R5 |
| F38 | R5: Split Bills | Equal Split Calculation Engine | Automatically divides total expense equally among all selected participants: `share = Total / N` | Total expense amount, array of participating member names | Array of per-member debt objects with equal share (rounded to 2 decimal places with remainder assigned to payer) | Division by zero prevented by requiring participants.length >= 1 | `ORIGINAL_REQUEST.md` R5, Verification Resources |
| F39 | R5: Split Bills | Custom Per-Member Allocation Engine | Allows custom allocation amounts per member with real-time remaining unallocated balance validation | Array of member amounts: `{ member: string, amount: number }` | Validates `sum(amounts) === totalAmount` within ₹0.01 tolerance | Disables submission and displays error if sum != totalAmount | `ORIGINAL_REQUEST.md` R5, Verification Resources |
| F40 | R5: Split Bills | Net Balance Engine (Amount Paid - Owed) | Real-time calculation engine computing each member's net balance: `(Amount Paid - Amount Owed) + (Settlements Paid - Settlements Received)` | Group expenses array and settlements array | Net balance per member (positive = owed to them, negative = they owe) | Net balance across all members in a closed group always sums to 0 | `ORIGINAL_REQUEST.md` R5, Verification Resources |
| F41 | R5: Split Bills | "You Owe" vs "Others Owe You" Engine | Aggregator computing overall amounts user owes to others and amounts others owe user across all groups | Member net balances across all groups | Aggregated `totalYouOwe` and `totalOthersOweYou` | Correctly handles self ("You") pairwise debt balances | `ORIGINAL_REQUEST.md` R5, Acceptance Criteria |
| F42 | R5: Split Bills | Record Settlement Modal ("Settle Up") | Interactive modal to record full or partial settlement between any two group members | Payer member, Payee member, Settlement amount, Date, Notes | Settlement record added; net balances immediately updated | Amount must be > 0 and <= outstanding debt (or allow custom settlement) | `ORIGINAL_REQUEST.md` R5 |
| F43 | R5: Split Bills | Group Activity Timeline Log | Chronological timeline log displaying expense additions and settlement actions with timestamps | Array of group expenses and settlements sorted by date | Visual activity feed with icon badges, member names, and action descriptions | Empty state shows "No activity yet. Log your first expense!" | `ORIGINAL_REQUEST.md` R5 |
| F44 | R5: Split Bills | Member Balance Cards with Avatar Badges | Visual display of each group member with initial avatar badge, paid amount, owed amount, and net balance pill | Member balance records | Member grid/list with green ("gets back ₹X") or red ("owes ₹X") pill | Zero balance displays gray "Settled up" pill | `ORIGINAL_REQUEST.md` R5 |
| F45 | Settings | User Preferences & Profile Screen | Settings view allowing user to configure Name, Currency Symbol (₹ / $ / €), Monthly Budget Target, and Data Reset | User preference form inputs | Updates context state and persists to `localStorage` | Reset action requires explicit confirmation dialog | `ORIGINAL_REQUEST.md` R1 |
| F46 | Settings | Reset to Initial Mock Data | Action button in Settings to reset all data back to the default initial mock state for evaluation and testing | User click with confirmation | Wipes custom data and re-hydrates baseline mock data | Requires confirmation modal to prevent accidental loss | `ORIGINAL_REQUEST.md` Acceptance Criteria |
| F47 | Visual & UI | Modern Fintech Styling & Palette | Consistent styling using `#F8FAFC` background, white rounded-2xl cards with `border-slate-100` and `shadow-sm`, and fintech typography | Tailwind CSS utility classes | Highly polished, cohesive aesthetic across all screens | No unstyled or clashing elements | `ORIGINAL_REQUEST.md` Visual Polish |
| F48 | Visual & UI | Responsive Layout & Shell | Responsive layout supporting desktop, tablet, and mobile with collapsible navigation and scrollable panels | Viewport width / media queries | Fluid grid and flexbox layout adapting to screen size | No horizontal overflowing or broken layouts | `ORIGINAL_REQUEST.md` Visual Polish |
| F49 | Visual & UI | Formatted Currency & Number Helpers | Consistent Indian Rupee formatting utility (`formatCurrency(amount)`) handling negatives, commas, and decimals | Numeric values | Formatted strings: `₹24,500`, `+₹30,000`, `-₹5,500` | Handles `NaN`, `null`, `undefined`, and negative numbers cleanly | `ORIGINAL_REQUEST.md` R2, Visual Polish |
| F50 | Verification | Automated Vitest Unit Test Suite | Test suite verifying financial calculations, keyword detection, and split bill ledger math | Test specs executed via `npx vitest run` | All test suites passing with 100% assertions satisfied | Zero test failures, zero regressions | `ORIGINAL_REQUEST.md` Verification Resources |
| F51 | Verification | Clean Production Vite Build | Application build pipeline producing optimized static bundle with zero TypeScript/CSS errors | `npm run build` | Clean `dist/` directory output | Exit code 0, 0 build warnings/errors | `ORIGINAL_REQUEST.md` Verification Resources |

---

## 3. Edge Cases

| # | Feature | Input | Observed / Required Behavior |
|---|---------|-------|-----------------------------|
| E01 | Financial Calculations | Initial state with zero transactions | Balance = ₹0, Income = ₹0, Expenses = ₹0, Savings = ₹0. Charts display empty state visuals without throwing runtime errors or division by zero. |
| E02 | Financial Calculations | All transactions are Expenses (no Income) | Total Income = ₹0, Savings = -Total Expenses, Savings Rate = 0%. Trend badges show negative net cash flow without crashing. |
| E03 | Financial Calculations | All transactions are Income (no Expenses) | Total Expenses = ₹0, Center text on Donut chart displays "₹0 Total Spent", Donut chart renders empty ring or gentle placeholder rather than broken SVG. |
| E04 | Auto-Categorization | Description contains mixed case (e.g. "Swiggy Order", "UBER RIDE", "aMaZoN") | Case-insensitive regex matches keywords accurately to 'Food', 'Travel', 'Shopping'. |
| E05 | Auto-Categorization | Description with punctuation/symbols (e.g. "cafe-latte", "wifi_bill#101", "pizza!!") | Punctuation is parsed or normalized; keyword boundary matching correctly triggers 'Food', 'Bills', etc. |
| E06 | Auto-Categorization | Substring false positives (e.g. "category", "vacation", "bureau", "scab", "swallowing") | Word boundary detection (`\b`) prevents partial matches (e.g. "cab" within "scab" or "salary" within "salaryman" if boundary enforced; specific keywords isolated). |
| E07 | Auto-Categorization | Keyword overlap / ambiguity (e.g. "dinner with uber driver") | Evaluates according to prioritized keyword dictionary or first matched category, while allowing immediate manual dropdown override by the user. |
| E08 | Auto-Categorization | User manually chooses category, then continues editing description | Explicit manual override state is respected unless the user clears it or switches auto-detection back on. |
| E09 | Auto-Categorization | Description contains no recognized keywords (e.g. "misc items", "gift from aunt") | Defaults to fallback category ('Other' for expenses, or user's active dropdown selection). |
| E10 | Add Transaction Form | Zero or negative amount entered (e.g. `0`, `-500`, `abc`) | Form validation blocks submission, highlights amount field with error message ("Amount must be greater than 0"). |
| E11 | Add Transaction Form | Empty description or whitespace-only string | Form validation blocks submission with error ("Description is required"). |
| E12 | Add Transaction Form | Future date or leap year date (e.g. "2028-02-29") | Standard date picker validation accepts valid calendar dates and formats correctly for sorting and display. |
| E13 | Split Bills Equal Split | Amount not evenly divisible by member count (e.g. ₹100 split among 3 members: 33.333...) | Shares are rounded to 2 decimal places (`₹33.33` each); remainder (₹0.01) is accounted for so total allocated sum equals exactly ₹100.00. |
| E14 | Split Bills Custom Split | Sum of custom allocations is less than or greater than total amount (e.g. Total ₹1,000, sum = ₹950) | Form shows remaining unallocated amount ("₹50 remaining to allocate") and disables the "Save Expense" button until difference == 0. |
| E15 | Split Bills Custom Split | Negative allocation value entered for a member | Disallowed by validation (allocations must be >= 0). |
| E16 | Split Bills Settlement | Settle amount greater than outstanding debt | System allows custom settlement or caps at outstanding balance with a friendly note ("Settles more than current debt"). |
| E17 | Split Bills Settlement | Settle when net balance is already ₹0 | Prevent settlement or notify user that members are already settled up. |
| E18 | Split Bills Engine | Only 1 member in group (self only) | Group creation requires at least 2 members ("You" plus at least 1 other person). |
| E19 | Split Bills Engine | Circular debts between multiple members (e.g. A owes B ₹100, B owes C ₹100, C owes A ₹100) | Net balance calculation engine computes accurate individual net balances (all net 0 in this circular case). |
| E20 | Filter & Search | Search query with special regex characters (e.g. `[`, `(`, `*`, `\`) | String search uses standard `String.prototype.includes` or escaped regex to prevent syntax errors. |
| E21 | Filter & Search | Filter returns 0 matching transactions | Table displays clean empty state illustration ("No transactions found matching your filters") with a "Clear Filters" button. |
| E22 | Month-over-Month Analytics | Only current month exists in history (no previous month) | Month-over-month trend comparison badges show "N/A" or "First Month" without producing `Infinity%` or `NaN%`. |
| E23 | LocalStorage | Browser storage disabled, incognito quota exceeded, or corrupted data | `try/catch` wrapper catches `QuotaExceededError` or JSON parse errors and cleanly falls back to in-memory state. |

---

## 4. Deep-Dive Specification Breakdown

### 4.1 Data Models & Type Definitions

The centralized React context and application modules operate on structured TypeScript interfaces:

```typescript
// Transaction Type
export type TransactionType = 'income' | 'expense';

// Standard Expense & Income Categories
export type Category =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Income'
  | 'Other';

// Transaction Entity
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string; // ISO string
}

// Split Bill Member Entity
export interface SplitMember {
  id: string;
  name: string; // e.g., 'You', 'Rahul', 'Priya'
  isUser: boolean; // true for primary user 'You'
  color?: string; // Avatar pill color
}

// Split Type
export type SplitType = 'equal' | 'custom';

// Per-member expense allocation
export interface ExpenseSplitAllocation {
  memberId: string;
  amount: number;
}

// Split Expense Record
export interface SplitExpense {
  id: string;
  groupId: string;
  description: string;
  totalAmount: number;
  paidByMemberId: string; // member who paid upfront
  splitType: SplitType;
  allocations: ExpenseSplitAllocation[]; // who owes what
  date: string;
  createdAt: string;
}

// Settlement Record between two members
export interface SplitSettlement {
  id: string;
  groupId: string;
  payerMemberId: string; // who paid
  payeeMemberId: string; // who received
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

// Split Group Entity
export interface SplitGroup {
  id: string;
  name: string;
  description?: string;
  members: SplitMember[];
  expenses: SplitExpense[];
  settlements: SplitSettlement[];
  createdAt: string;
}

// User Financial Profile & Preferences
export interface UserPreferences {
  name: string;
  currency: string; // '₹'
  monthlyBudget: number; // e.g., 20000
}
```

---

### 4.2 Mathematical Calculation Formulas

#### 1. Core Financial Metrics (Dashboard & Context)
- **Total Income**:
  $$\text{Total Income} = \sum_{t \in T, \, t.\text{type} = \text{'income'}} t.\text{amount}$$
- **Total Expenses**:
  $$\text{Total Expenses} = \sum_{t \in T, \, t.\text{type} = \text{'expense'}} t.\text{amount}$$
- **Total Balance**:
  $$\text{Total Balance} = \text{Total Income} - \text{Total Expenses}$$
- **Net Savings**:
  $$\text{Net Savings} = \text{Total Income} - \text{Total Expenses}$$
- **Savings Rate (%)**:
  $$\text{Savings Rate} = \begin{cases} \left(\frac{\text{Net Savings}}{\text{Total Income}}\right) \times 100, & \text{if } \text{Total Income} > 0 \\ 0, & \text{otherwise} \end{cases}$$

#### 2. Spending by Category Breakdown
- For category $c \in \text{Categories}$:
  $$\text{Category Total}(c) = \sum_{t \in T, \, t.\text{type} = \text{'expense'}, \, t.\text{category} = c} t.\text{amount}$$
  $$\text{Category Percentage}(c) = \begin{cases} \left(\frac{\text{Category Total}(c)}{\text{Total Expenses}}\right) \times 100, & \text{if } \text{Total Expenses} > 0 \\ 0, & \text{otherwise} \end{cases}$$

#### 3. Month-over-Month (MoM) Trend Calculation
Given current month total $M_{\text{curr}}$ and previous month total $M_{\text{prev}}$:
$$\Delta\% = \begin{cases} \left(\frac{M_{\text{curr}} - M_{\text{prev}}}{M_{\text{prev}}}\right) \times 100, & \text{if } M_{\text{prev}} > 0 \\ 0, & \text{if } M_{\text{prev}} = 0 \text{ and } M_{\text{curr}} = 0 \\ +100, & \text{if } M_{\text{prev}} = 0 \text{ and } M_{\text{curr}} > 0 \end{cases}$$

#### 4. Split Bills Ledger Math

For a given group $G$, member $m \in G.\text{members}$:
1. **Total Paid for Expenses by Member $m$**:
   $$\text{Paid}_{\text{exp}}(m) = \sum_{e \in G.\text{expenses}, \, e.\text{paidByMemberId} = m.\text{id}} e.\text{totalAmount}$$
2. **Total Owed for Expenses by Member $m$**:
   $$\text{Owed}_{\text{exp}}(m) = \sum_{e \in G.\text{expenses}} \left( \sum_{a \in e.\text{allocations}, \, a.\text{memberId} = m.\text{id}} a.\text{amount} \right)$$
3. **Total Settlements Sent by Member $m$**:
   $$\text{Settlements}_{\text{sent}}(m) = \sum_{s \in G.\text{settlements}, \, s.\text{payerMemberId} = m.\text{id}} s.\text{amount}$$
4. **Total Settlements Received by Member $m$**:
   $$\text{Settlements}_{\text{rcvd}}(m) = \sum_{s \in G.\text{settlements}, \, s.\text{payeeMemberId} = m.\text{id}} s.\text{amount}$$
5. **Net Balance of Member $m$**:
   $$\text{Net Balance}(m) = \big(\text{Paid}_{\text{exp}}(m) - \text{Owed}_{\text{exp}}(m)\big) + \big(\text{Settlements}_{\text{sent}}(m) - \text{Settlements}_{\text{rcvd}}(m)\big)$$
   - If $\text{Net Balance}(m) > 0$: Member is **owed** money (others owe them).
   - If $\text{Net Balance}(m) < 0$: Member **owes** money (they must pay).
   - If $\text{Net Balance}(m) = 0$: Member is completely settled.

6. **Global User Standing**:
   - For primary user $u$ ("You"):
     - In group $g$: If $\text{Net Balance}_g(u) < 0$, user owes $|\text{Net Balance}_g(u)|$.
     - If $\text{Net Balance}_g(u) > 0$, user is owed $\text{Net Balance}_g(u)$.
   - Across all active groups:
     $$\text{Total You Owe} = \sum_{g \in \text{Groups}} \max\big(0, -\text{Net Balance}_g(u)\big)$$
     $$\text{Total Others Owe You} = \sum_{g \in \text{Groups}} \max\big(0, \text{Net Balance}_g(u)\big)$$

---

### 4.3 Keyword Auto-Categorization Inference Matrix

The auto-categorization algorithm matches keywords in the user-entered description to pre-assign the `category` and `type` fields in real time:

| Category | Inferred Type | Exact Keywords (Case-Insensitive) | Regex Pattern / Boundary Match |
|----------|---------------|-----------------------------------|--------------------------------|
| **Food** | `expense` | `burger`, `pizza`, `swiggy`, `zomato`, `cafe`, `lunch`, `dinner`, `restaurant`, `coffee`, `snack`, `groceries`, `starbucks`, `mcdonalds` | `/\b(burger\|pizza\|swiggy\|zomato\|cafe\|lunch\|dinner\|restaurant\|coffee\|snack\|groceries\|starbucks\|mcdonalds)\b/i` |
| **Travel** | `expense` | `uber`, `ola`, `cab`, `metro`, `petrol`, `fuel`, `diesel`, `auto`, `bus`, `flight`, `train`, `irctc`, `toll`, `parking` | `/\b(uber\|ola\|cab\|metro\|petrol\|fuel\|diesel\|auto\|bus\|flight\|train\|irctc\|toll\|parking)\b/i` |
| **Shopping** | `expense` | `amazon`, `flipkart`, `myntra`, `shoes`, `clothes`, `zara`, `h&m`, `nike`, `mall`, `electronics`, `t-shirt`, `jeans` | `/\b(amazon\|flipkart\|myntra\|shoes\|clothes\|zara\|h&m\|nike\|mall\|electronics\|t-shirt\|jeans)\b/i` |
| **Bills** | `expense` | `electricity`, `wifi`, `recharge`, `bill`, `rent`, `water`, `maintenance`, `gas`, `broadband`, `utility`, `dth` | `/\b(electricity\|wifi\|recharge\|bill\|rent\|water\|maintenance\|gas\|broadband\|utility\|dth)\b/i` |
| **Entertainment** | `expense` | `movie`, `netflix`, `cinema`, `spotify`, `hotstar`, `prime`, `concert`, `gaming`, `steam`, `theater`, `bookmyshow` | `/\b(movie\|netflix\|cinema\|spotify\|hotstar\|prime\|concert\|gaming\|steam\|theater\|bookmyshow)\b/i` |
| **Income** | `income` | `salary`, `stipend`, `freelance`, `bonus`, `dividend`, `interest`, `refund`, `cashback` | `/\b(salary\|stipend\|freelance\|bonus\|dividend\|interest\|refund\|cashback)\b/i` |
| **Other** | `expense` | (No match / Fallback) | Defaults to `Other` if no keywords trigger match |

**Execution Logic**:
1. When `description` input changes:
   - Normalize string (`trim()`, `toLowerCase()`).
   - If user has manually picked a category *after* typing, do not override unless description changes significantly or user toggles auto-detect.
   - Test description against regex patterns in defined priority order (Income $\rightarrow$ Food $\rightarrow$ Travel $\rightarrow$ Shopping $\rightarrow$ Bills $\rightarrow$ Entertainment).
   - If match found, set `category` and update `type` accordingly.
   - If no match found, retain current category or fallback to `Other`.

---

### 4.4 UI & Component Architecture Specification

#### View Hierarchy:
```
App Root
├── Sidebar (Fixed Left: Navigation, Brand Logo, Active State)
├── Header (Top: Dynamic Greeting, Date Badge, User Avatar)
└── Main Content Container (Padded, Responsive, bg-slate-50)
    ├── [Tab: 'dashboard']
    │   ├── Top Row: 4 Metric Cards (Balance, Income, Expenses, Savings)
    │   ├── Middle Row (Grid 3-col or 2-col + sidebar):
    │   │   ├── Spending by Category Donut Chart (Center Label + Legend + Time Filter)
    │   │   ├── Monthly Overview Grouped Bar Chart (Income vs Expense)
    │   │   └── Quick Actions Card (Add Tx, Split Bill, Analytics, Budget)
    │   ├── Bottom Row (Grid 3-col):
    │   │   ├── Recent Transactions Table (Top 5 + category icons)
    │   │   ├── Split Bills Quick Summary ("You are owed ₹200")
    │   │   └── Dynamic Financial Insights (Smart bullet tips)
    │   └── Footer (Copyright & Tagline)
    │
    ├── [Tab: 'transactions']
    │   ├── Top Controls Bar (Search Input, Category Filter, Type Filter, "Add Transaction" CTA)
    │   └── Dual Column Layout:
    │       ├── Left Main Table (Full transaction history, sortable columns, edit/delete actions)
    │       └── Right Summary Sidebar (Inflow, Outflow, Category Mini Progress Bars)
    │
    ├── [Tab: 'analytics']
    │   ├── Top Trend Metric Cards (Month-over-month changes, savings rate, daily average)
    │   ├── Charts Row:
    │   │   ├── Detailed Expense Donut Chart with interactive tooltip
    │   │   └── Grouped Bar Chart with monthly comparison
    │   ├── Category Spending Progress Bars (Horizontal bars with % of budget)
    │   └── Top Spending Insights Highlight Banner (Highest category, health assessment)
    │
    ├── [Tab: 'split-bills']
    │   ├── Top Metric Cards (Total Groups, Total You Owe, Total Others Owe You, Recent Expenses)
    │   ├── Group Selector Bar & "Create Group" Action
    │   ├── Group Active Workspace:
    │   │   ├── Group Header & Member Badges
    │   │   ├── Member Balances Grid (Payer/Ower badges, Settle Up CTA)
    │   │   ├── Expenses List (Equal vs Custom splits, payer details)
    │   │   └── Activity Timeline Log
    │
    └── [Tab: 'settings']
        ├── Profile Configuration (Name, Currency, Monthly Budget Target)
        ├── Data Management ("Reset to Initial Mock Data", "Export JSON")
        └── About & Version Information
```

#### Modal Dialogs:
1. **Add / Edit Transaction Modal**:
   - Description input with keyword badge ("⚡ Auto-detected: Food").
   - Amount input formatted with currency symbol prefix.
   - Type toggle (Income / Expense).
   - Category selector dropdown with color-coded category icons.
   - Date picker (defaults to today `YYYY-MM-DD`).
   - Notes / Memo optional field.
   - Cancel and Save buttons with input validation.

2. **Create Split Group Modal**:
   - Group Name input (e.g. "Goa Vacation 2026", "Flatmates 402").
   - Members tag input (automatically includes "You", supports adding members by name: e.g. "Rahul", "Priya").
   - Save button creating group.

3. **Log Group Expense Modal**:
   - Group selector (pre-selected if inside group).
   - Expense Description / Title.
   - Total Amount input.
   - Paid By dropdown (select member who paid upfront).
   - Split Method toggle:
     - **Equally**: Displays calculated equal share per participant.
     - **Custom**: Displays numeric input per member with live remaining balance indicator.
   - Participant checkboxes (toggle who is included in the split).

4. **Settle Up Modal**:
   - Payer selection dropdown.
   - Payee selection dropdown.
   - Amount input (pre-populated with net owed amount, editable for partial settlement).
   - Date and optional notes.
   - Confirm Settlement button.

---

### 4.5 Initial Mock Data Specification

To strictly fulfill `ORIGINAL_REQUEST.md` R2 and R5:
- **Total Balance**: ₹24,500
- **Total Income**: ₹30,000 (e.g. Salary ₹30,000)
- **Total Expenses**: ₹5,500 (e.g. Food: ₹2,200, Travel: ₹1,100, Shopping: ₹1,200, Bills: ₹1,000)
- **Net Savings**: ₹24,500
- **Split Bills Quick Status**: "You are owed ₹200"
  - Active group: "Goa Trip" with members: "You", "Rahul", "Priya".
  - Expense 1: "Beach Shack Dinner" ₹1,500 paid by You, split equally (₹500 each $\rightarrow$ Rahul owes ₹500, Priya owes ₹500).
  - Expense 2: "Scooter Rental" ₹900 paid by Rahul, split equally (₹300 each $\rightarrow$ You owe Rahul ₹300, Priya owes Rahul ₹300).
  - Net for You with Rahul: You paid ₹1,500 (share ₹500), Rahul owes ₹500. Rahul paid ₹900 (You owe ₹300). Net: Rahul owes You ₹200.
  - Priya settled ₹500 with You.
  - Current net balance for You: **You are owed ₹200** (from Rahul).

---

## 5. Verification Matrix & Acceptance Criteria

| ID | Criterion | Verification Method | Expected Result |
|----|-----------|---------------------|-----------------|
| V01 | Clean Vite Build | `npm run build` or `npx vite build` | Exit code 0, 0 TypeScript errors, bundle generated in `dist/` |
| V02 | Automated Test Suite | `npm test` or `npx vitest run` | All test suites pass (finance math, auto-categorizer, split ledger) |
| V03 | Financial Calculation Correctness | Unit tests for balance, income, expenses, savings rate | Formula outputs match exact mathematical expectations |
| V04 | Auto-Categorization Keyword Accuracy | Unit tests covering all specified keywords and regex boundaries | Keywords map to correct categories; case-insensitivity passes |
| V05 | Split Bills Balance Engine | Unit tests covering equal split, custom split, and settlement recalculation | Member net balances sum to 0; user owed metrics are exact |
| V06 | Real-time Cross-View Sync | Interactive / component test: add transaction $\rightarrow$ verify Dashboard cards update immediately | React Context state updates immediately propagate to UI |
| V07 | Visual Design Adherence | Visual verification: card borders (`border-slate-100`), background (`#F8FAFC`), modern fintech styling | Meets visual polish requirements without clashing styles |

---
*Report prepared by `survey_spec_miner_1`.*
