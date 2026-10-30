# E2E Test Infra: Personal Finance Intelligence

## Test Philosophy
- **Opaque-box, requirement-driven**: Test suite is derived strictly from user requirements in `ORIGINAL_REQUEST.md`, exercising the application as an end-user would.
- **Methodology**: Systematic 4-tier coverage (Category-Partition, Boundary Value Analysis, Pairwise Combinatorial, Real-World Workloads) plus Tier 5 adversarial hardening.
- **Progressive Testability**: Tier 1 tests verify pure functions and core state; Tier 2 tests boundary conditions; Tier 3 tests multi-feature interactions; Tier 4 tests complete real-world workflows.

## Feature Inventory Test Coverage Matrix
| # | Feature | Source | Tier 1 (Isolated) | Tier 2 (Boundary) | Tier 3 (Cross-Feature) | Tier 4 (Real-World) |
|---|---------|--------|:-----------------:|:-----------------:|:---------------------:|:-------------------:|
| 1 | Financial KPIs (Balance, Income, Expense, Savings) | R2, Line 18 | 5 | 5 | ✓ | ✓ |
| 2 | Auto-Categorization (6 Dictionaries, Regex) | R3, Lines 32-39 | 6 | 6 | ✓ | ✓ |
| 3 | Split Bills Equal Split Engine | R5, Lines 49-50 | 5 | 5 | ✓ | ✓ |
| 4 | Split Bills Custom Allocation Engine | R5, Line 49 | 5 | 5 | ✓ | ✓ |
| 5 | Split Bills Net Balance & Settlement Math | R5, Lines 50-51 | 5 | 5 | ✓ | ✓ |
| 6 | Transaction Management (Add/Edit/Delete/Search) | R3, Lines 30-39 | 5 | 5 | ✓ | ✓ |
| 7 | Dashboard & Recharts Rendering | R2, Lines 17-27 | 5 | 5 | ✓ | ✓ |
| 8 | Analytics & MoM Trends | R4, Lines 41-45 | 5 | 5 | ✓ | ✓ |
| 9 | Multi-Group Split Ledger & Balances | R5, Lines 46-52 | 5 | 5 | ✓ | ✓ |

## Test Architecture
- **Test Runner**: Vitest 1.6+ configured with `jsdom` environment in `vite.config.ts`.
- **Harness & Polyfills**: `src/test/setup.ts` providing global mock for `ResizeObserver`, `window.matchMedia`, and DOM canvas mocks for Recharts.
- **Pass/Fail Semantics**: 100% tests must pass with exit code 0 (`npm test` or `npx vitest run`).
- **Directory Layout**:
  - `src/test/calculations.test.ts` (Financial math, KPI formulas, savings rate, MoM calculations)
  - `src/test/autoCategorize.test.ts` (Word boundary keyword matching, override state machine, multi-word matching)
  - `src/test/splitLedger.test.ts` (Equal split, custom split, settlement impact, multi-group consolidation)
  - `src/test/e2e.test.tsx` (Complete user flow integration: add transaction -> verify KPI updates -> switch tabs -> create split group -> log expense -> settle up)

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | End-to-End Monthly Budget Cycle | Add salary income, add various categorized expenses, verify KPI cards & charts update immediately | High |
| 2 | Split Bill Weekend Trip | Create "Goa Trip" group (You, Alice, Bob), log equal and custom expenses, settle up partial amounts, verify net balances | High |
| 3 | Transaction Search, Edit, and Auto-Categorize | Type "zomato dinner", verify auto-category Food, manually override to Entertainment, search and edit | Medium |
| 4 | Analytics Trend & Category Health Inspection | Verify category progress bars, savings rate badge, and highest spending category detection | Medium |

## Coverage Thresholds
- **Tier 1**: ≥ 45 test cases (5 per feature domain)
- **Tier 2**: ≥ 45 test cases (boundary limits, 0 values, negative amounts, decimal rounding, empty inputs)
- **Tier 3**: ≥ 10 test cases (cross-feature interactions: transaction mutations affecting dashboard, split settlements updating owed cards)
- **Tier 4**: ≥ 5 realistic application workflows
- **Tier 5**: Adversarial stress testing for edge cases
- **Total Minimum**: ≥ 100 automated test assertions
