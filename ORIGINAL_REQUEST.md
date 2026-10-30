# Original User Request

## Initial Request — 2026-10-30T16:21:56Z

Build a production-ready, highly polished React (Vite) single-page application for "Personal Finance Intelligence" (Personal Expense Tracker) with a modern fintech aesthetic using Tailwind CSS, Lucide React icons, and Recharts.

Working directory: C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence
Integrity mode: development

## Requirements

### R1. Core Architecture, Navigation & Shared State
- Implement a fixed left sidebar with navigation links (Dashboard, Transactions, Analytics, Split Bills, Settings) and top navigation bar with dynamic greetings, user avatar, and date badge.
- Provide a centralized React Context (`FinanceContext`) managing `transactions`, `splitGroups`, and `settlements` with instant real-time synchronization across all views.
- Ensure seamless client-side view switching without full page reloads.

### R2. Dashboard Screen
- Display top 4 financial summary cards (Total Balance: ₹24,500, Total Income: ₹30,000, Total Expenses: ₹5,500, Savings: ₹24,500) with dedicated colored icon badge pills.
- Render middle row featuring:
  - "Spending by Category" Recharts Donut Chart with center total amount label ("₹5,500 Total Spent"), time filter, and category legend breakdown (Food, Shopping, Travel, Bills, Other).
  - "Monthly Overview" grouped bar chart comparing Income vs Expenses across recent months (Jul, Aug, Sep).
  - "Quick Actions" card with action buttons for adding transactions, creating split bills, viewing analytics, and setting budgets.
- Render bottom row with:
  - Recent Transactions table showing date, description with category icon, category pill, amount formatted with color coding, and type badge.
  - Split Bills quick card displaying owed balance and active group summary ("You are owed ₹200").
  - Recent Insights card with dynamic financial bullet tips.
- Include a footer with copyright and tagline.

### R3. Dedicated Transactions Screen with Keyword Auto-Categorization
- Full transactions management with live search filtering across description/amount and category filter dropdowns.
- Dual-column layout displaying the main transaction table alongside a quick financial summary and recent categories breakdown.
- Add Transaction modal with real-time keyword auto-detection that automatically infers categories:
  - burger, pizza, swiggy, zomato, cafe, lunch, dinner -> 'Food'
  - uber, ola, cab, metro, petrol, fuel -> 'Travel'
  - amazon, flipkart, myntra, shoes, clothes -> 'Shopping'
  - electricity, wifi, recharge, bill, rent -> 'Bills'
  - movie, netflix, cinema, spotify -> 'Entertainment'
  - salary, stipend, freelance, bonus -> 'Income'
  while allowing manual overrides.

### R4. Dedicated Financial Analytics Screen
- Metric overview cards with month-over-month trend badges (+/- percentage changes).
- Visual breakdown row: expense donut chart with center label, grouped monthly overview bar chart, and horizontal progress bars for category spending with percentage widths.
- Top spending insights highlight banner with icon cards for highest expense category, monthly savings, and budget health.

### R5. Split Bills Module (Single-User Group Expense Ledger)
- Ledger interface managing groups, expenses, and settlements where group members are text names without requiring user accounts or invitations.
- Group metrics cards (Total Groups, Total Amount You Owe, Total Amount Others Owe You, Recent Expenses).
- Interactive modals to create new groups, log group expenses with equal split or custom per-member allocations, and record settlements.
- Real-time balance calculation engine computing net balances (Amount Paid - Amount Owed) per participant and overall owed amounts.
- Activity timeline log and member avatar displays.

## Verification Resources
- Verification commands to run in the working directory:
  - `npm run build` (or `npx vite build`) must succeed with 0 errors.
  - Test suite (`npm test` or `npx vitest run`) must verify:
    1. Financial calculation correctness (balance, total income, total expenses, savings).
    2. Auto-categorization keyword detection function.
    3. Split bills balance calculation engine (equal split and custom split calculations).

## Acceptance Criteria

### Functionality & Real-time Recalculation
- [ ] Adding, editing, or deleting a transaction immediately updates summary cards, charts, and tables on the Dashboard, Transactions, and Analytics views.
- [ ] Adding a group expense or settling up in Split Bills instantly recalculates "You Owe" and "Others Owe You" metrics.
- [ ] Auto-categorization correctly detects category from description keywords and updates the category picker in the modal.

### Visual Polish & Styling
- [ ] Replicates the modern fintech aesthetic: soft light gray-blue background (`#F8FAFC`), crisp white rounded-2xl cards with subtle borders (`border-slate-100`) and soft shadows (`shadow-sm`).
- [ ] Clean responsive layout across desktop and tablet screen sizes.
- [ ] Recharts graphs (Donut chart with custom center text, grouped bar chart) render with proper tooltips, legends, and theme colors.

### Code Quality & Verification
- [ ] Project builds cleanly (`npm run build`) with zero TypeScript and build errors.
- [ ] Automated tests pass for finance calculations, keyword detection, and split bill ledger math.
- [ ] Development server starts cleanly and serves the application with initial realistic mock data.
