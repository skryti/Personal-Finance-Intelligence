# Empirical Stress Testing & Mathematical Engine Analysis

**Date**: 2026-10-30T16:50:00Z  
**Author**: Challenger 1 (Empirical Math & Calculation Specialist)  
**Target Systems**:
1. Financial Summary & KPI Calculations (`src/utils/calculations.ts`)
2. Keyword Auto-Categorization Engine (`src/utils/autoCategorize.ts`)
3. Split Ledger Math & Settlement Engine (`src/utils/splitLedger.ts`)
4. Supporting Test Suite (`src/test/empiricalStress.test.ts`)

---

## Executive Summary & Verdict

- **Overall Risk Assessment**: **HIGH**
- **Explicit Verdict**: **REQUEST_CHANGES**

### Primary Blockers:
1. **Critical Defect in Keyword Auto-Categorization (`src/utils/autoCategorize.ts:26`)**:
   The engine uses `if (regex.test(normalized) || normalized.includes(keyword))` instead of strict word-boundary matching. Because of `normalized.includes(keyword)`, common English words trigger catastrophic false positives:
   - `"cabinet"` contains `"cab"` $\rightarrow$ Auto-categorized as **Travel** (instead of Other).
   - `"swiggyy"` contains `"swiggy"` $\rightarrow$ Auto-categorized as **Food**.
   - `"petroleum"` contains `"petrol"` $\rightarrow$ Auto-categorized as **Travel** (instead of Other).
   - `"transparent phone case"` contains `"rent"` $\rightarrow$ Auto-categorized as **Bills**.
   - `"parenting book"` contains `"rent"` $\rightarrow$ Auto-categorized as **Bills**.
   - `"current account"` contains `"rent"` $\rightarrow$ Auto-categorized as **Bills**.
   - `"billionaire biography"` contains `"bill"` $\rightarrow$ Auto-categorized as **Bills**.
   - `"rechargeable battery"` contains `"recharge"` $\rightarrow$ Auto-categorized as **Bills**.
   - `"cinematography course"` contains `"cinema"` $\rightarrow$ Auto-categorized as **Entertainment**.
   - `"metropolitan ticket"` contains `"metro"` $\rightarrow$ Auto-categorized as **Travel**.
   This explicitly breaks the requirement in `DISPATCH.md`: *"negative cases (words containing substring without boundary like 'cabinet', 'swiggyy', 'petroleum')"*.

2. **Missing Custom Allocation Balance Validation (`src/components/split/SplitBillsView.tsx:104-125` & `src/utils/splitLedger.ts`)**:
   When users select "Custom Split" for group expenses, neither the UI nor the engine validates that the sum of custom allocations matches the total expense amount ($\sum \text{allocations} == \text{amount}$). An unbalanced expense permanently violates the fundamental ledger conservation invariant ($\sum \text{netBalance} == 0$), causing the group ledger to become inconsistent.

3. **Missing Contract Method `calculateSimplifiedDebts` (`src/utils/splitLedger.ts`)**:
   `PROJECT.md` line 179 and Feature Inventory item #43 specifies `calculateSimplifiedDebts(group: SplitGroup): Array<{ from: string; to: string; amount: number }>`. This function is completely missing from `splitLedger.ts`.

4. **Interface Contract Mismatch in Auto-Categorization (`src/utils/autoCategorize.ts`)**:
   `PROJECT.md` line 173 defines the contract as:
   `export function autoCategorize(description: string): { category: TransactionCategory; matchedKeyword: string | null }`.
   The implementation exports `detectCategoryFromKeyword` (with `matchedKeyword?: string`), leaving `autoCategorize` undefined.

---

## 1. Financial Summary Calculations Engine

**File**: `src/utils/calculations.ts`

### 1.1 Implementation Analysis
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
    savingsRate: Math.round(savingsRate * 10) / 10,
  };
}
```

### 1.2 Empirical Stress-Test Results

| Test Scenario | Inputs | Expected Output | Actual Output | Status |
|---|---|---|---|---|
| **Empty Transactions (0 values)** | `transactions = []` | Income: 0, Expense: 0, Balance: 0, Savings: 0, Rate: 0% | Income: 0, Expense: 0, Balance: 0, Savings: 0, Rate: 0% | **PASS** |
| **Zero Income with Expenses (Deficit)** | Income: 0, Expenses: ₹5,500 | Balance: -₹5,500, Savings: -₹5,500, Rate: 0% | Balance: -5500, Savings: -5500, Rate: 0% | **PASS** |
| **Non-Zero Income, Zero Expense** | Income: ₹50,000, Expenses: 0 | Balance: ₹50,000, Savings: ₹50,000, Rate: 100% | Balance: 50000, Savings: 50000, Rate: 100% | **PASS** |
| **Negative Balance (Expense > Income)** | Income: ₹10,000, Expenses: ₹25,000 | Balance: -₹15,000, Savings: -₹15,000, Rate: -150% | Balance: -15000, Savings: -15000, Rate: -150% | **PASS** |
| **Large Amounts (Crore Scale)** | Income: ₹10,000,000, Expenses: ₹4,500,000 | Balance: ₹5,500,000, Savings: ₹5,500,000, Rate: 55% | Balance: 5500000, Savings: 5500000, Rate: 55% | **PASS** |
| **Zero Expense Category Spending** | Only Income tx | Spending list: `[]` | `[]` | **PASS** |
| **Decimal Precision Drift** | Floating point decimal expenses | Accurate 2-decimal rounded balance | No rounding on `totalBalance` / `savings` (IEEE 754 drift potential) | **OBSERVATION** |

### 1.3 Key Finding on Currency Formatting
In `src/utils/formatters.ts`:
```typescript
export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(absAmount);
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
```
`maximumFractionDigits: 0` rounds away all fractional rupees (paise). While this provides clean display for integer rupee amounts on summary cards, in split bills with penny fractions (e.g. ₹33.34 vs ₹33.33), amounts are displayed identically as "₹33".

---

## 2. Keyword Auto-Categorization Engine

**File**: `src/utils/autoCategorize.ts`

### 2.1 Implementation Analysis
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
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(normalized) || normalized.includes(keyword)) { // <--- FLAW HERE
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

### 2.2 Empirical Failure Demonstration (False Positive Matrix)

Because `normalized.includes(keyword)` is evaluated whenever `regex.test(normalized)` returns false, any substring inclusion matches regardless of word boundaries.

| Description Tested | Substring Trigger | Expected Category | Actual Produced Category | Match Keyword | Test Result |
|---|---|:---:|:---:|:---:|:---:|
| `"kitchen cabinet"` | `"cab"` in Travel | `Other` | **Travel** | `cab` | **FAIL (False Positive)** |
| `"swiggyy"` | `"swiggy"` in Food | `Other` | **Food** | `swiggy` | **FAIL (False Positive)** |
| `"petroleum shares"` | `"petrol"` in Travel | `Other` | **Travel** | `petrol` | **FAIL (False Positive)** |
| `"billionaire book"` | `"bill"` in Bills | `Other` | **Bills** | `bill` | **FAIL (False Positive)** |
| `"rechargeable battery"` | `"recharge"` in Bills | `Other` | **Bills** | `recharge` | **FAIL (False Positive)** |
| `"transparent case"` | `"rent"` in Bills | `Other` | **Bills** | `rent` | **FAIL (False Positive)** |
| `"parenting course"` | `"rent"` in Bills | `Other` | **Bills** | `rent` | **FAIL (False Positive)** |
| `"current account"` | `"rent"` in Bills | `Other` | **Bills** | `rent` | **FAIL (False Positive)** |
| `"cinematography workshop"`| `"cinema"` in Entertainment | `Other` | **Entertainment** | `cinema` | **FAIL (False Positive)** |
| `"metropolitan museum"` | `"metro"` in Travel | `Other` | **Travel** | `metro` | **FAIL (False Positive)** |

### 2.3 Proposed Remediation
Change line 26 of `src/utils/autoCategorize.ts`:
```typescript
// Replace:
if (regex.test(normalized) || normalized.includes(keyword)) {

// With:
if (regex.test(normalized)) {
```
Also export the canonical alias matching `PROJECT.md` contract:
```typescript
export function autoCategorize(description: string): { category: TransactionCategory; matchedKeyword: string | null } {
  const res = detectCategoryFromKeyword(description);
  return {
    category: res.category,
    matchedKeyword: res.matchedKeyword ?? null,
  };
}
```

---

## 3. Split Ledger Math Engine

**File**: `src/utils/splitLedger.ts`

### 3.1 Equal Split Penny Remainder Conservation
The algorithm:
```typescript
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

#### Prime Splits Verification ($\sum \text{shares} == \text{amount}$):
- **2 Members (₹100.01)**:
  - Base share: ₹50.00
  - Remainder: ₹0.01
  - Allocations: `[50.01, 50.00]` $\rightarrow$ Sum = **₹100.01** (**CONSERVED**)
- **3 Members (₹100.00)**:
  - Base share: ₹33.33
  - Remainder: ₹0.01
  - Allocations: `[33.34, 33.33, 33.33]` $\rightarrow$ Sum = **₹100.00** (**CONSERVED**)
- **3 Members (₹100.01)**:
  - Base share: ₹33.33
  - Remainder: ₹0.02
  - Allocations: `[33.35, 33.33, 33.33]` $\rightarrow$ Sum = **₹100.01** (**CONSERVED**)
- **5 Members (₹100.03)**:
  - Base share: ₹20.00
  - Remainder: ₹0.03
  - Allocations: `[20.03, 20.00, 20.00, 20.00, 20.00]` $\rightarrow$ Sum = **₹100.03** (**CONSERVED**)
- **7 Members (₹100.00)**:
  - Base share: ₹14.28
  - Remainder: ₹0.04
  - Allocations: `[14.32, 14.28, 14.28, 14.28, 14.28, 14.28, 14.28]` $\rightarrow$ Sum = **₹100.00** (**CONSERVED**)
- **7 Members (₹1000.50)**:
  - Base share: ₹142.92
  - Remainder: ₹0.06
  - Allocations: `[142.98, 142.92 * 6]` $\rightarrow$ Sum = **₹1000.50** (**CONSERVED**)

*Observation*: Remainder is lumped entirely into member index 0 (`You`). While this strictly satisfies penny conservation, standard fair-share algorithms distribute 1 penny sequentially across members (`+0.01` each) until remainder is exhausted.

### 3.2 Custom Allocation Validation
In `src/components/split/SplitBillsView.tsx`:
```typescript
    if (splitType === 'equal') {
      finalAllocations = calculateEqualSplit(total, activeGroup.members);
    } else {
      finalAllocations = activeGroup.members.map((m) => ({
        member: m,
        amount: parseFloat(customAllocations[m] || '0'),
      }));
    }
```
- **Finding**: There is NO validation that $\sum \text{finalAllocations.amount} == \text{total}$.
- **Impact**: If a user logs an expense of ₹1,000 but enters custom amounts summing to ₹600, the payer gets credited ₹1,000 while member shares only sum to ₹600. The group ledger is thrown off-balance by ₹400 ($\sum \text{netBalance} \neq 0$).
- **Remediation**:
  1. Add `validateCustomAllocations(total: number, allocations: SplitAllocation[]): { valid: boolean; difference: number }` to `src/utils/splitLedger.ts`.
  2. In `SplitBillsView.tsx`, prevent submission and display an error alert when `Math.abs(sum - total) > 0.01`.

### 3.3 Debt Settlement Math & Invariant
In `calculateGroupBalances`:
```typescript
  for (const set of settlements) {
    paidMap[set.fromMember] = (paidMap[set.fromMember] || 0) + set.amount;
    paidMap[set.toMember] = (paidMap[set.toMember] || 0) - set.amount;
  }
```
- Debt settlements correctly reduce debtor's liability and creditor's credit.
- When all debts are settled, all members' net balances become `0.00`.
- Conservation holds: $\sum \text{netBalance} == 0$.

### 3.4 Multi-Group Consolidation
In `calculateSplitLedgerSummary`:
- Groups are iterated, and for each group where member is `'You'`:
  - `netBalance > 0` accumulates to `totalOthersOweYou`.
  - `netBalance < 0` accumulates to `totalYouOwe`.
- Overall `netBalance = totalOthersOweYou - totalYouOwe`.
- Tested across multiple groups: mathematically correct.

---

## 4. Test Suite Artifacts Created

We created `src/test/empiricalStress.test.ts` containing:
- 6 tests for Financial Summary calculations (zero income, zero expense, negative balance, large numbers, category spending).
- 3 test suites for Keyword Auto-Categorization (27 keyword dictionary coverage, case insensitivity, critical substring false positive tests).
- 4 tests for Split Ledger math (equal split penny conservation across 2, 3, 5, 7 members, debt clearing settlement cycles, multi-group consolidation).

---

## 5. Summary of Recommended Worker Actions

1. In `src/utils/autoCategorize.ts`:
   - Remove `|| normalized.includes(keyword)` from line 26; keep only `regex.test(normalized)` to enforce word boundaries.
   - Export `autoCategorize` matching `PROJECT.md` line 173.
2. In `src/utils/splitLedger.ts`:
   - Implement `validateCustomAllocations(amount: number, allocations: SplitAllocation[]): { isValid: boolean; difference: number }`.
   - Implement `calculateSimplifiedDebts` as contracted in `PROJECT.md` line 179.
3. In `src/components/split/SplitBillsView.tsx`:
   - Add balance validation in `handleAddExpenseSubmit` before calling `addSplitExpense` when `splitType === 'custom'`.
