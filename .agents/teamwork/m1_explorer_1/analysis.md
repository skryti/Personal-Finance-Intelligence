# Scaffolding and Tooling Configuration Analysis (Milestone 1)

## 1. Executive Summary
This document defines the exact, production-ready project scaffolding and tooling configuration for **Personal Finance Intelligence**.
The configuration is engineered to satisfy all requirements from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `TEST_INFRA.md`:
- **Build Tool**: Vite 5 with React 18, TypeScript 5, and `@` path alias mapped to `./src`.
- **CSS Architecture**: Tailwind CSS 3.4 with custom modern fintech tokens (`#F8FAFC` background, `rounded-2xl` cards, `border-slate-100`, `shadow-sm`, and category color tokens) plus PostCSS.
- **Testing Architecture**: Vitest 1.6+ with JSDOM environment, `@testing-library/react`, and a specialized `src/test/setup.ts` that includes a full `ResizeObserver` polyfill and DOM dimension mocks for Recharts `ResponsiveContainer`.
- **Typing & Linting**: Strict TypeScript configuration with `@/*` path mapping, Vitest globals, and DOM iterable support.

---

## 2. File Specifications

### 2.1 `package.json`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\package.json`

```json
{
  "name": "personal-finance-intelligence",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^15.0.7",
    "@testing-library/user-event": "^14.5.2",
    "@types/node": "^20.14.0",
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

#### Rationale
- `recharts@2.12.7` provides stable support for Donut Charts (`PieChart`, `Pie`, `Cell`), Grouped Bar Charts (`BarChart`, `Bar`), and `ResponsiveContainer`.
- `lucide-react@0.344.0` provides tree-shakable icons for all financial categories, actions, navigation, and badges.
- `clsx` and `tailwind-merge` allow seamless conditional styling of badge pills and active sidebar items.
- Vitest 1.6 + jsdom + testing-library provide rapid in-memory testing with 0 build steps.

---

### 2.2 `vite.config.ts`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\vite.config.ts`

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
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

#### Key Highlights
- `/// <reference types="vitest" />` ensures TypeScript recognizes the `test` block within `defineConfig` without auxiliary plugins.
- Resolves `@` alias portably across ES modules using `fileURLToPath(import.meta.url)`.
- Configures `globals: true` so tests can invoke `describe`, `it`, `expect`, `beforeEach`, and `vi` without boilerplate imports.

---

### 2.3 `tsconfig.json` & `tsconfig.node.json`

#### `tsconfig.json`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strictness */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,

    /* Path Aliasing */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },

    /* Vitest & Testing Library Types */
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### `tsconfig.node.json`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\tsconfig.node.json`

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

#### `src/vite-env.d.ts`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\src\vite-env.d.ts`

```typescript
/// <reference types="vite/client" />
```

---

### 2.4 `tailwind.config.js`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\tailwind.config.js`

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
          bg: '#F8FAFC',        // Slate 50 background
          card: '#FFFFFF',      // Pure white card surfaces
          border: '#F1F5F9',    // Slate 100 subtle borders
          muted: '#64748B',     // Slate 500 secondary text
          primary: '#4F46E5',   // Indigo 600 primary action
          primaryHover: '#4338CA', // Indigo 700
          income: '#10B981',    // Emerald 500 (Income, positive balance)
          expense: '#F43F5E',   // Rose 500 (Expenses, negative balance)
          savings: '#6366F1',   // Indigo 500 (Savings rate)
          warning: '#F59E0B',   // Amber 500
        },
        category: {
          food: '#F97316',          // Orange 500
          travel: '#0EA5E9',        // Sky 500
          shopping: '#A855F7',      // Purple 500
          bills: '#EF4444',         // Red 500
          entertainment: '#8B5CF6', // Violet 500
          income: '#10B981',        // Emerald 500
          other: '#64748B',         // Slate 500
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

---

### 2.5 `postcss.config.js`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\postcss.config.js`

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

### 2.6 `index.html`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234F46E5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect width='20' height='14' x='2' y='5' rx='2'/><line x1='2' x2='22' y1='10' y2='10'/></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Personal Finance Intelligence</title>
    <meta name="description" content="Production-ready personal finance dashboard and group expense ledger." />
    <!-- Preconnect Google Fonts for Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 2.7 `src/index.css`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\src\index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #F8FAFC;
    color: #0F172A;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

@layer components {
  /* Reusable Fintech Card */
  .fintech-card {
    @apply bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-200;
  }

  /* Interactive Card with subtle hover elevation */
  .fintech-card-hover {
    @apply bg-white rounded-2xl border border-slate-100 shadow-sm p-6 transition-all duration-200 hover:shadow-md hover:border-slate-200;
  }

  /* Metric KPI Card */
  .kpi-card {
    @apply bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between;
  }

  /* Badge Pill */
  .badge-pill {
    @apply inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium;
  }

  /* Custom Clean Scrollbar */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94A3B8;
  }
}

/* Recharts Custom Styling Overrides */
.recharts-default-tooltip {
  border-radius: 0.75rem !important;
  border: 1px solid #E2E8F0 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05) !important;
  background-color: rgba(255, 255, 255, 0.98) !important;
  padding: 8px 12px !important;
}
```

---

### 2.8 `src/test/setup.ts`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\src\test\setup.ts`

```typescript
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// 1. ResizeObserver Polyfill for Recharts ResponsiveContainer
class ResizeObserverMock {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: {
            top: 0,
            left: 0,
            width: 800,
            height: 400,
            right: 800,
            bottom: 400,
            x: 0,
            y: 0,
            toJSON: () => {},
          },
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      this
    );
  }

  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// 2. Mock element dimensions so Recharts ResponsiveContainer measures non-zero dimensions in JSDOM
Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  value: 800,
});
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  value: 400,
});

// 3. Mock window.matchMedia for responsive UI checks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 4. Mock window.scrollTo
window.scrollTo = vi.fn();

// 5. Clean localStorage and mocks between tests
beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});
```

#### Why This Polyfill Setup is Critical
1. **Recharts SVG Container**: In jsdom, standard elements return `clientWidth = 0` and `clientHeight = 0`. Recharts `ResponsiveContainer` inspects these dimensions and conditionally renders nothing (`null`) if either is 0. Mocking `clientWidth` (800) and `clientHeight` (400) ensures SVG elements (Donut charts, grouped bars) render reliably in automated tests.
2. **`ResizeObserver`**: Node.js and JSDOM lack a native `ResizeObserver`. Without this polyfill, any component importing `ResponsiveContainer` immediately throws `ReferenceError: ResizeObserver is not defined`.
3. **State Isolation**: `window.localStorage.clear()` in `beforeEach` guarantees that any persistent store state written during one test does not leak into subsequent test suites.

---

## 3. Minimal Initial Entry Files

### 3.1 `src/main.tsx`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\src\main.tsx`

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 3.2 `src/App.tsx`
Target File: `C:\Users\Sanskriti\.gemini\antigravity\scratch\personal-finance-intelligence\src\App.tsx`

```tsx
import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-fintech-bg text-slate-900 flex items-center justify-center">
      <div className="fintech-card max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-800">Personal Finance Intelligence</h1>
        <p className="text-sm text-fintech-muted mt-2">Production Scaffolding Initialized</p>
      </div>
    </div>
  );
}
```

---

## 4. Verification & Validation Protocol

The implementer should execute the following verification commands to ensure zero errors:

1. **Clean Installation**:
   ```powershell
   npm install
   ```
2. **TypeScript Compilation Check**:
   ```powershell
   npx tsc --noEmit
   ```
3. **Production Build Pipeline**:
   ```powershell
   npm run build
   ```
   *Expected outcome*: Vite bundles `dist/` cleanly with 0 errors and zero chunk resolution warnings.
4. **Test Suite Execution**:
   ```powershell
   npm test
   ```
   *Expected outcome*: Vitest discovers `src/test/setup.ts`, initializes JSDOM, and completes test executions with exit code 0.

---

## 5. Cohesion & Handoff Alignment with Peer Explorers
- **Peer M1 Explorer 2 (Math Engines)**: All utility files (`calculations.ts`, `autoCategorize.ts`, `splitLedger.ts`) will compile cleanly under TypeScript 5 `strict: true` and will be executed by Vitest without needing external mock libraries.
- **Peer M1 Explorer 3 (Types & FinanceContext)**: `src/types/index.ts` and `src/context/FinanceContext.tsx` can use the `@` alias seamlessly (e.g. `import { Transaction } from '@/types'`).
