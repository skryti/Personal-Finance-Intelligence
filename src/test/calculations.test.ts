import { describe, it, expect } from 'vitest';
import { calculateFinancialSummary, calculateCategorySpending } from '../utils/calculations';
import { formatCurrency, formatDate } from '../utils/formatters';
import { INITIAL_TRANSACTIONS } from '../data/initialMockData';
import { Transaction } from '../types/finance';

describe('Financial Calculations Engine', () => {
  // ==========================================
  // TIER 1: ISOLATED TESTS (Primary Happy Path)
  // ==========================================
  describe('Tier 1: Isolated Financial KPIs & Formulas', () => {
    it('correctly calculates initial mock values matching R2 requirements (₹24,500 balance, ₹30,000 income, ₹5,500 expenses)', () => {
      const summary = calculateFinancialSummary(INITIAL_TRANSACTIONS);

      expect(summary.totalIncome).toBe(30000);
      expect(summary.totalExpenses).toBe(5500);
      expect(summary.totalBalance).toBe(24500);
      expect(summary.savings).toBe(24500);
      expect(summary.savingsRate).toBe(81.7);
    });

    it('calculates total balance accurately as income minus expenses', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Salary', amount: 50000, type: 'income', category: 'Income', date: '2026-10-01' },
        { id: '2', description: 'Rent', amount: 15000, type: 'expense', category: 'Bills', date: '2026-10-02' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalBalance).toBe(35000);
      expect(summary.savings).toBe(35000);
    });

    it('aggregates multiple income streams correctly', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Primary Job', amount: 40000, type: 'income', category: 'Income', date: '2026-10-01' },
        { id: '2', description: 'Freelance Project', amount: 15000, type: 'income', category: 'Income', date: '2026-10-05' },
        { id: '3', description: 'Stock Dividend', amount: 2500, type: 'income', category: 'Income', date: '2026-10-10' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalIncome).toBe(57500);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.totalBalance).toBe(57500);
      expect(summary.savingsRate).toBe(100);
    });

    it('aggregates multiple expense categories correctly', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Groceries', amount: 3000, type: 'expense', category: 'Food', date: '2026-10-01' },
        { id: '2', description: 'Metro pass', amount: 1000, type: 'expense', category: 'Travel', date: '2026-10-02' },
        { id: '3', description: 'Electricity', amount: 1500, type: 'expense', category: 'Bills', date: '2026-10-03' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalExpenses).toBe(5500);
      expect(summary.totalIncome).toBe(0);
      expect(summary.totalBalance).toBe(-5500);
    });

    it('calculates savings rate percentage rounded to 1 decimal place', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Income', amount: 3000, type: 'income', category: 'Income', date: '2026-10-01' },
        { id: '2', description: 'Expense', amount: 1000, type: 'expense', category: 'Food', date: '2026-10-02' },
      ];
      // Savings = 2000, Rate = 2000/3000 * 100 = 66.666... -> 66.7
      const summary = calculateFinancialSummary(txs);
      expect(summary.savingsRate).toBe(66.7);
    });

    it('calculates category spending breakdown with amounts and percentages', () => {
      const spending = calculateCategorySpending(INITIAL_TRANSACTIONS);

      const food = spending.find((c) => c.category === 'Food');
      expect(food).toBeDefined();
      expect(food?.amount).toBe(2100); // 1450 + 650
      expect(food?.percentage).toBe(38.2);

      const shopping = spending.find((c) => c.category === 'Shopping');
      expect(shopping?.amount).toBe(1200);
      expect(shopping?.percentage).toBe(21.8);

      const bills = spending.find((c) => c.category === 'Bills');
      expect(bills?.amount).toBe(999);
      expect(bills?.percentage).toBe(18.2);

      const travel = spending.find((c) => c.category === 'Travel');
      expect(travel?.amount).toBe(750);
      expect(travel?.percentage).toBe(13.6);

      const entertainment = spending.find((c) => c.category === 'Entertainment');
      expect(entertainment?.amount).toBe(451);
      expect(entertainment?.percentage).toBe(8.2);
    });

    it('assigns designated theme colors for each category', () => {
      const spending = calculateCategorySpending(INITIAL_TRANSACTIONS);
      const food = spending.find((c) => c.category === 'Food');
      expect(food?.color).toBe('#F59E0B');

      const shopping = spending.find((c) => c.category === 'Shopping');
      expect(shopping?.color).toBe('#EC4899');

      const travel = spending.find((c) => c.category === 'Travel');
      expect(travel?.color).toBe('#3B82F6');

      const bills = spending.find((c) => c.category === 'Bills');
      expect(bills?.color).toBe('#8B5CF6');

      const entertainment = spending.find((c) => c.category === 'Entertainment');
      expect(entertainment?.color).toBe('#10B981');
    });

    it('formats currency with Indian numbering system and Rupee symbol (formatCurrency)', () => {
      expect(formatCurrency(24500)).toBe('₹24,500');
      expect(formatCurrency(30000)).toBe('₹30,000');
      expect(formatCurrency(5500)).toBe('₹5,500');
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('formats dates into readable human format (formatDate)', () => {
      const formatted = formatDate('2026-09-18');
      expect(formatted).toContain('Sep');
      expect(formatted).toContain('18');
      expect(formatted).toContain('2026');
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY VALUE ANALYSIS
  // ==========================================
  describe('Tier 2: Boundary Value Analysis', () => {
    it('handles empty transaction list gracefully with zero totals', () => {
      const summary = calculateFinancialSummary([]);

      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.totalBalance).toBe(0);
      expect(summary.savings).toBe(0);
      expect(summary.savingsRate).toBe(0);
    });

    it('returns empty array when calculating category spending on empty list', () => {
      const spending = calculateCategorySpending([]);
      expect(spending).toEqual([]);
    });

    it('handles single transaction of type income', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Salary', amount: 10000, type: 'income', category: 'Income', date: '2026-10-01' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalIncome).toBe(10000);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.totalBalance).toBe(10000);
      expect(summary.savingsRate).toBe(100);

      const spending = calculateCategorySpending(txs);
      expect(spending).toEqual([]);
    });

    it('handles single transaction of type expense', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Snack', amount: 50, type: 'expense', category: 'Food', date: '2026-10-01' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(50);
      expect(summary.totalBalance).toBe(-50);
      expect(summary.savingsRate).toBe(0);

      const spending = calculateCategorySpending(txs);
      expect(spending).toHaveLength(1);
      expect(spending[0].category).toBe('Food');
      expect(spending[0].amount).toBe(50);
      expect(spending[0].percentage).toBe(100);
    });

    it('handles zero income with non-zero expenses (negative balance, savings rate 0)', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Fuel', amount: 2000, type: 'expense', category: 'Travel', date: '2026-10-01' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalBalance).toBe(-2000);
      expect(summary.savings).toBe(-2000);
      expect(summary.savingsRate).toBe(0);
    });

    it('handles income exactly matching expenses (break-even, zero savings, 0% savings rate)', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Stipend', amount: 5000, type: 'income', category: 'Income', date: '2026-10-01' },
        { id: '2', description: 'Laptop EMI', amount: 5000, type: 'expense', category: 'Bills', date: '2026-10-02' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalBalance).toBe(0);
      expect(summary.savings).toBe(0);
      expect(summary.savingsRate).toBe(0);
    });

    it('formats negative currency with minus sign before rupee symbol (-₹5,500)', () => {
      expect(formatCurrency(-5500)).toBe('-₹5,500');
      expect(formatCurrency(-200)).toBe('-₹200');
      expect(formatCurrency(-1000000)).toBe('-₹10,00,000');
    });

    it('formats large values in Indian Lakhs and Crores', () => {
      expect(formatCurrency(100000)).toBe('₹1,00,000');
      expect(formatCurrency(10000000)).toBe('₹1,00,00,000');
    });

    it('handles fractional currency amounts without NaN or crash', () => {
      expect(formatCurrency(1234.56)).toBe('₹1,235'); // Rounded for clean UI display
      expect(formatCurrency(-99.99)).toBe('-₹100');
    });

    it('handles unrecognized category with default color fallback in category spending', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Unknown item', amount: 300, type: 'expense', category: 'CustomUnknown' as any, date: '2026-10-01' },
      ];
      const spending = calculateCategorySpending(txs);
      expect(spending[0].color).toBe('#94A3B8');
    });
  });

  // ==========================================
  // TIER 3: CROSS-FEATURE CALCULATION TESTS
  // ==========================================
  describe('Tier 3: Dynamic Transaction Recalculations', () => {
    it('accurately recalculates totals when adding an expense to existing transactions', () => {
      const extraExpense: Transaction = {
        id: 'tx-extra',
        description: 'Extra books',
        amount: 1000,
        type: 'expense',
        category: 'Shopping',
        date: '2026-09-25',
      };

      const summary = calculateFinancialSummary([...INITIAL_TRANSACTIONS, extraExpense]);

      expect(summary.totalIncome).toBe(30000);
      expect(summary.totalExpenses).toBe(6500);
      expect(summary.totalBalance).toBe(23500);
      expect(summary.savings).toBe(23500);
      expect(summary.savingsRate).toBe(78.3); // (23500/30000) * 100 = 78.33%
    });

    it('accurately recalculates totals when removing a transaction', () => {
      // Remove salary transaction
      const withoutSalary = INITIAL_TRANSACTIONS.filter((t) => t.id !== 'tx-1');
      const summary = calculateFinancialSummary(withoutSalary);

      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(5500);
      expect(summary.totalBalance).toBe(-5500);
      expect(summary.savingsRate).toBe(0);
    });

    it('recalculates category spending distribution when a transaction is added', () => {
      const extraFood: Transaction = {
        id: 'tx-food',
        description: 'Buffet',
        amount: 1000,
        type: 'expense',
        category: 'Food',
        date: '2026-09-29',
      };

      const spending = calculateCategorySpending([...INITIAL_TRANSACTIONS, extraFood]);
      const food = spending.find((c) => c.category === 'Food');
      expect(food?.amount).toBe(3100); // 2100 + 1000
      // Total expenses = 6500, Food percentage = (3100 / 6500) * 100 = 47.7%
      expect(food?.percentage).toBe(47.7);
    });
  });

  // ==========================================
  // TIER 5: ADVERSARIAL STRESS & RESILIENCE
  // ==========================================
  describe('Tier 5: Adversarial Stress & Numeric Precision', () => {
    it('maintains precision with multiple decimal fractions without accumulating drift', () => {
      const txs: Transaction[] = [
        { id: '1', description: 'Item 1', amount: 10.15, type: 'expense', category: 'Shopping', date: '2026-10-01' },
        { id: '2', description: 'Item 2', amount: 20.25, type: 'expense', category: 'Shopping', date: '2026-10-01' },
        { id: '3', description: 'Item 3', amount: 30.60, type: 'expense', category: 'Shopping', date: '2026-10-01' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalExpenses).toBeCloseTo(61.0, 2);
    });

    it('handles category spending percentages summing approximately to 100%', () => {
      const spending = calculateCategorySpending(INITIAL_TRANSACTIONS);
      const totalPercentage = spending.reduce((sum, item) => sum + item.percentage, 0);
      expect(totalPercentage).toBeGreaterThanOrEqual(99.0);
      expect(totalPercentage).toBeLessThanOrEqual(100.5);
    });

    it('handles invalid date string gracefully in formatDate without throwing', () => {
      const result = formatDate('not-a-valid-date');
      expect(typeof result).toBe('string');
    });

    it('correctly ignores transactions with unrecognized type safely', () => {
      const txs: any[] = [
        { id: '1', description: 'Unknown type', amount: 500, type: 'other_type', category: 'Other', date: '2026-10-01' },
      ];
      const summary = calculateFinancialSummary(txs);
      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.totalBalance).toBe(0);
    });
  });
});
