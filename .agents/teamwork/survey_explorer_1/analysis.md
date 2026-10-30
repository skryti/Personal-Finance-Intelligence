# Technical Analysis & Greenfield Architecture Specification
**Author**: `survey_explorer_1`  
**Date**: 2026-10-30  
**Project**: Personal Finance Intelligence (React SPA)  
**Target Root**: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence`

---

## 1. Executive Summary & Workspace Survey

### 1.1 Project Workspace Assessment
- **Status**: Greenfield directory.
- **Observed Contents**:
  - `ORIGINAL_REQUEST.md` (Original user specification).
  - `.agents/` (Subagent and orchestrator metadata).
  - No prior `package.json`, `node_modules`, `src/`, or configuration files exist.
- **Tooling Environment**:
  - Operating System: Windows (PowerShell environment).
  - Node.js runtime and npm ecosystem are required to support the modern React + Vite toolchain.
  - Explorer read-only mode dictates zero direct code file generation in the project root; all specifications herein serve as the authoritative blueprint for worker execution.

---

## 2. Technology Stack & Architecture

| Layer | Recommended Choice | Rationale |
|---|---|---|
| **Bundler & Dev Server** | **Vite 5.x** (`@vitejs/plugin-react`) | Instant HMR, rapid production builds with Rollup, native ES module support, clean integration with Vitest. |
| **UI Framework** | **React 18.3+** with **TypeScript 5.4+** | Industry standard, robust typing for financial calculation models, seamless React Context (`FinanceContext`) reactivity. |
| **Styling & Design System** | **Tailwind CSS 3.4+** + **PostCSS** + **Autoprefixer** | High velocity, utility-first styling adhering to the modern fintech aesthetic: soft gray-blue backdrop (`#F8FAFC`), crisp white cards (`bg-white rounded-2xl border border-slate-100 shadow-sm`), pill badges. |
| **Iconography** | **Lucide React** (`lucide-react`) | Lightweight, tree-shakeable, elegant SVG icons specified in R1–R5 (`Wallet`, `TrendingUp`, `TrendingDown`, `PiggyBank`, `Users`, `Receipt`, `Plus`, etc.). |
| **Data Visualization** | **Recharts 2.12+** | Declarative charting library for React. Matches R2 and R4 requirements: Donut Chart with center total text (`PieChart`, `Pie`, `Cell`), Monthly Overview grouped Bar Chart (`BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `Legend`). |
| **Testing Harness** | **Vitest 1.6+** + **@testing-library/react** + **jsdom** | Native Vite integration, fast in-memory execution, full compatibility with Jest matchers (`@testing-library/jest-dom`), runs via `npx vitest run` or `npm test`. |
| **Utilities** | **clsx** + **tailwind-merge** | Helper `cn(...)` for safe and conditional Tailwind class composition. |

---

## 3. Configuration Blueprints

### 3.1 `package.json`
```json
{
  "name": "personal-finance-intelligence",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.348.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^15.0.7",
    "@types/node": "^20.14.9",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
```

### 3.2 `vite.config.ts`
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

### 3.3 `tsconfig.json` & `tsconfig.node.json`
**`tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**`tsconfig.node.json`**:
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### 3.4 `tailwind.config.js` & `postcss.config.js`
**`tailwind.config.js`**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#F1F5F9',
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
          accent: '#4F46E5',
          income: '#10B981',
          expense: '#F43F5E',
          savings: '#6366F1',
          warning: '#F59E0B'
        }
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
```

**`postcss.config.js`**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 3.5 `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-[#F8FAFC] text-slate-900 antialiased font-sans min-h-screen selection:bg-indigo-500 selection:text-white;
    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  }
}

/* Custom scrollbars for ledger and transaction tables */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
```

### 3.6 `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Personal Finance Intelligence</title>
    <!-- Inter Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#F8FAFC]">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3.7 `src/test/setup.ts` (Vitest Test Environment Setup)
```typescript
import '@testing-library/jest-dom';

// Polyfill ResizeObserver for Recharts responsive containers in jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = window.ResizeObserver || ResizeObserverMock;
```

---

## 4. Source Directory Architecture

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
│   │   ├── finance.ts           # Core types: Transaction, SplitGroup, Settlement, etc.
│   │   └── navigation.ts        # Tab & View state enum/unions
│   ├── context/
│   │   └── FinanceContext.tsx   # Centralized React Context & Custom Hooks
│   ├── data/
│   │   └── initialMockData.ts   # Seed transactions, groups, members matching R2
│   ├── utils/
│   │   ├── cn.ts                # clsx + twMerge utility
│   │   ├── formatters.ts        # Currency (₹) and date formatters
│   │   ├── calculations.ts      # Pure math functions for balance, income, expense, savings
│   │   ├── autoCategorize.ts    # Keyword detection engine
│   │   └── splitLedger.ts       # Split bill balance calculation engine
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx      # Fixed left navigation sidebar
│   │   │   ├── Topbar.tsx       # Greetings, avatar, date pill
│   │   │   └── Footer.tsx       # Copyright & tagline footer
│   │   ├── common/
│   │   │   ├── Card.tsx         # Reusable rounded-2xl card wrapper
│   │   │   ├── Badge.tsx        # Status & category pill badges
│   │   │   ├── Modal.tsx        # Dialog overlay component
│   │   │   └── Button.tsx       # Themed button variations
│   │   ├── dashboard/
│   │   │   ├── MetricCards.tsx  # 4 Summary Cards (₹24,500, ₹30,000, ₹5,500, ₹24,500)
│   │   │   ├── CategoryDonutChart.tsx # Recharts Donut chart with center label
│   │   │   ├── MonthlyBarChart.tsx    # Recharts Grouped bar chart (Jul, Aug, Sep)
│   │   │   ├── QuickActions.tsx       # Action buttons card
│   │   │   ├── RecentTransactionsTable.tsx # Recent transaction rows
│   │   │   ├── SplitBillsSummaryCard.tsx   # "You are owed ₹200" quick card
│   │   │   └── FinancialInsightsCard.tsx   # Dynamic bullet tips
│   │   ├── transactions/
│   │   │   ├── TransactionsView.tsx        # Main view with dual-column layout
│   │   │   ├── TransactionTable.tsx        # Search, category filter & table
│   │   │   ├── AddTransactionModal.tsx     # Modal with auto-categorization
│   │   │   └── CategoryBreakdownSidebar.tsx # Right column summary breakdown
│   │   ├── analytics/
│   │   │   ├── AnalyticsView.tsx           # Full analytics dashboard
│   │   │   ├── CategoryProgressBars.tsx    # Horizontal progress bars
│   │   │   └── SpendingInsightsBanner.tsx  # Highlight cards
│   │   └── split/
│   │       ├── SplitBillsView.tsx          # Ledger view with member cards
│   │       ├── CreateGroupModal.tsx        # Create group modal
│   │       ├── AddGroupExpenseModal.tsx    # Equal / custom split expense modal
│   │       ├── RecordSettlementModal.tsx   # Settlement modal
│   │       └── ActivityTimeline.tsx        # Activity log
│   └── test/
│       ├── setup.ts             # Test environment setup
│       ├── calculations.test.ts # Financial balance correctness
│       ├── autoCategorize.test.ts # Keyword auto-detection tests
│       └── splitLedger.test.ts  # Equal & custom split calculation tests
```

---

## 5. Critical Technical Considerations & Edge Cases

1. **Recharts in jsdom / Vitest**:
   - Recharts requires `ResizeObserver` which is not built into standard `jsdom`. The test setup (`src/test/setup.ts`) must mock `ResizeObserver` and unit tests targeting calculation engines (`calculations.ts`, `autoCategorize.ts`, `splitLedger.ts`) should be pure TypeScript tests that execute without needing DOM rendering, guaranteeing 100% test reliability and sub-second runtimes.
2. **Path Aliasing in Vite vs TypeScript**:
   - Both `vite.config.ts` (`resolve.alias`) and `tsconfig.json` (`compilerOptions.paths`) must map `@/*` to `src/*` in exact alignment to prevent build or TypeScript resolution failures.
3. **Currency & Locale Formatting**:
   - The user specification strictly requires Indian Rupee symbol (`₹`) and standard comma grouping (e.g., `₹24,500`, `₹5,500`, `₹30,000`). Formatter utility should use `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })` or manual string formatting to ensure identical rendering across Node, test environments, and browsers.
4. **Auto-Categorization Case-Insensitivity & Boundary Matching**:
   - The auto-detection function must lower-case transaction descriptions and test against substring/regex boundaries for all specified keywords (`swiggy`, `zomato`, `uber`, `ola`, `amazon`, `flipkart`, `electricity`, `wifi`, `salary`, etc.).
5. **Zero Dependency Bloat**:
   - By leveraging React Context + `useReducer` / `useState`, external state management libraries (Redux, Zustand) are unnecessary and would introduce overhead. React Context satisfies all R1 cross-view synchronization requirements.

---

## 6. Execution Roadmap for Implementation Workers

- **Worker 1 (Milestone 1)**:
  - Generate root configuration files (`package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `index.html`).
  - Run `npm install` to install dependencies.
  - Implement core type definitions (`src/types/finance.ts`), pure utility calculation engines (`calculations.ts`, `autoCategorize.ts`, `splitLedger.ts`), mock data (`initialMockData.ts`), and `FinanceContext.tsx`.
  - Implement pure unit tests (`src/test/calculations.test.ts`, `src/test/autoCategorize.test.ts`, `src/test/splitLedger.test.ts`) and verify via `npm test`.
- **Worker 2 (Milestone 2)**:
  - Implement App shell, fixed Left Sidebar, Topbar with dynamic greetings, and the full Dashboard Screen (summary cards, Recharts Donut & Bar charts, Quick Actions, recent table, split summary card, insights).
- **Worker 3 (Milestone 3)**:
  - Implement Dedicated Transactions Screen with dual-column layout, live search, category filtering, and Add Transaction Modal with real-time keyword auto-categorization.
- **Worker 4 (Milestone 4)**:
  - Implement Dedicated Financial Analytics Screen with metric cards, donut & grouped bar charts, horizontal percentage progress bars, and spending insight banners.
- **Worker 5 (Milestone 5)**:
  - Implement Split Bills Module with groups ledger, net balance calculation engine (amount paid - amount owed), equal & custom split modals, settlement modal, and activity timeline.
- **Worker 6 (Milestone 6 / Review & Audit)**:
  - Run full test suite (`npm test`), build validation (`npm run build`), ensure 0 TypeScript errors, verify initial mock values (₹24,500 balance, ₹30,000 income, ₹5,500 expenses, ₹24,500 savings, ₹200 owed).
