import { describe, it, expect } from 'vitest';
import { calculateFinancialSummary } from './calculations';
import { detectCategoryFromKeyword } from './autoCategorize';
import { Transaction } from '../types/finance';

describe('Financial Calculations', () => {
  it('correctly calculates totalIncome, totalExpenses, and totalBalance', () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        user_id: 'user-123',
        title: 'Monthly Salary',
        amount: 30000,
        type: 'income',
        category: 'Income',
        date: '2026-10-01',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        user_id: 'user-123',
        title: 'Swiggy Dinner',
        amount: 500,
        type: 'expense',
        category: 'Food',
        date: '2026-10-02',
        created_at: new Date().toISOString(),
      },
    ];

    const summary = calculateFinancialSummary(mockTransactions);
    expect(summary.totalIncome).toBe(30000);
    expect(summary.totalExpenses).toBe(500);
    expect(summary.totalBalance).toBe(29500);
    expect(summary.savings).toBe(29500);
  });

  it('handles empty transactions by defaulting to zeros', () => {
    const summary = calculateFinancialSummary([]);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.totalBalance).toBe(0);
    expect(summary.savings).toBe(0);
    expect(summary.savingsRate).toBe(0);
  });
});

describe('Auto Categorization', () => {
  it('auto detects Food for food keywords', () => {
    const result1 = detectCategoryFromKeyword('ordered pizza on zomato');
    expect(result1?.category).toBe('Food');
    const result2 = detectCategoryFromKeyword('uber ride to college');
    expect(result2?.category).toBe('Travel');
  });
});
