import { describe, it, expect } from 'vitest';
import { calculateFinancialSummary, calculateCategorySpending } from '../utils/calculations';
import { detectCategoryFromKeyword, CATEGORY_KEYWORDS } from '../utils/autoCategorize';
import {
  calculateEqualSplit,
  calculateGroupBalances,
  calculateSplitLedgerSummary,
} from '../utils/splitLedger';
import { Transaction, SplitGroup, SplitExpense, Settlement } from '../types/finance';

describe('Empirical Stress Testing: Financial Summary Calculations', () => {
  it('handles zero income and zero expenses cleanly without NaN or Infinity', () => {
    const summary = calculateFinancialSummary([]);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.totalBalance).toBe(0);
    expect(summary.savings).toBe(0);
    expect(summary.savingsRate).toBe(0);
    expect(Number.isNaN(summary.savingsRate)).toBe(false);
  });

  it('handles zero income with non-zero expenses (deficit spending)', () => {
    const txs: Transaction[] = [
      { id: '1', description: 'Grocery', amount: 5000, type: 'expense', category: 'Food', date: '2026-09-01' },
      { id: '2', description: 'Metro', amount: 500, type: 'expense', category: 'Travel', date: '2026-09-02' },
    ];
    const summary = calculateFinancialSummary(txs);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpenses).toBe(5500);
    expect(summary.totalBalance).toBe(-5500);
    expect(summary.savings).toBe(-5500);
    expect(summary.savingsRate).toBe(0); // Guarded against 0-division
  });

  it('handles non-zero income with zero expenses (100% savings rate)', () => {
    const txs: Transaction[] = [
      { id: '1', description: 'Salary', amount: 50000, type: 'income', category: 'Income', date: '2026-09-01' },
    ];
    const summary = calculateFinancialSummary(txs);
    expect(summary.totalIncome).toBe(50000);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.totalBalance).toBe(50000);
    expect(summary.savings).toBe(50000);
    expect(summary.savingsRate).toBe(100);
  });

  it('handles negative net balance when expenses exceed income', () => {
    const txs: Transaction[] = [
      { id: '1', description: 'Stipend', amount: 10000, type: 'income', category: 'Income', date: '2026-09-01' },
      { id: '2', description: 'Laptop', amount: 25000, type: 'expense', category: 'Shopping', date: '2026-09-05' },
    ];
    const summary = calculateFinancialSummary(txs);
    expect(summary.totalIncome).toBe(10000);
    expect(summary.totalExpenses).toBe(25000);
    expect(summary.totalBalance).toBe(-15000);
    expect(summary.savings).toBe(-15000);
    expect(summary.savingsRate).toBe(-150); // Negative rate correctly calculated
  });

  it('handles large transaction amounts (crore scale) without overflow', () => {
    const txs: Transaction[] = [
      { id: '1', description: 'Consulting Contract', amount: 10000000, type: 'income', category: 'Income', date: '2026-09-01' },
      { id: '2', description: 'Office Real Estate', amount: 4500000, type: 'expense', category: 'Bills', date: '2026-09-10' },
    ];
    const summary = calculateFinancialSummary(txs);
    expect(summary.totalIncome).toBe(10000000);
    expect(summary.totalExpenses).toBe(4500000);
    expect(summary.totalBalance).toBe(5500000);
    expect(summary.savings).toBe(5500000);
    expect(summary.savingsRate).toBe(55);
  });

  it('correctly handles category spending calculation with zero expense', () => {
    const txs: Transaction[] = [
      { id: '1', description: 'Salary', amount: 30000, type: 'income', category: 'Income', date: '2026-09-01' },
    ];
    const categorySpending = calculateCategorySpending(txs);
    expect(categorySpending).toHaveLength(0);
  });
});

describe('Empirical Stress Testing: Keyword Auto-Categorization', () => {
  it('matches all specified keywords across all 6 categories', () => {
    const expectedMappings: Record<string, string> = {
      // Food
      burger: 'Food',
      pizza: 'Food',
      swiggy: 'Food',
      zomato: 'Food',
      cafe: 'Food',
      lunch: 'Food',
      dinner: 'Food',
      // Travel
      uber: 'Travel',
      ola: 'Travel',
      cab: 'Travel',
      metro: 'Travel',
      petrol: 'Travel',
      fuel: 'Travel',
      // Shopping
      amazon: 'Shopping',
      flipkart: 'Shopping',
      myntra: 'Shopping',
      shoes: 'Shopping',
      clothes: 'Shopping',
      // Bills
      electricity: 'Bills',
      wifi: 'Bills',
      recharge: 'Bills',
      bill: 'Bills',
      rent: 'Bills',
      // Entertainment
      movie: 'Entertainment',
      netflix: 'Entertainment',
      cinema: 'Entertainment',
      spotify: 'Entertainment',
      // Income
      salary: 'Income',
      stipend: 'Income',
      freelance: 'Income',
      bonus: 'Income',
    };

    for (const [keyword, expectedCategory] of Object.entries(expectedMappings)) {
      const result = detectCategoryFromKeyword(`Payment for ${keyword}`);
      expect(result.category).toBe(expectedCategory);
      expect(result.matchedKeyword?.toLowerCase()).toBe(keyword);
    }
  });

  it('matches case-insensitively (UPPERCASE, lowercase, TitleCase)', () => {
    expect(detectCategoryFromKeyword('SWIGGY DINNER').category).toBe('Food');
    expect(detectCategoryFromKeyword('Uber Cab').category).toBe('Travel');
    expect(detectCategoryFromKeyword('AMAZON SHOPPING').category).toBe('Shopping');
    expect(detectCategoryFromKeyword('WiFi Recharge').category).toBe('Bills');
    expect(detectCategoryFromKeyword('NETFLIX 4K').category).toBe('Entertainment');
    expect(detectCategoryFromKeyword('SALARY CREDIT').category).toBe('Income');
  });

  // EMPIRICAL BUG DETECTION:
  // Words containing substring without boundary MUST NOT falsely match keywords
  it('CRITICAL ADVERSARIAL TEST: detects whether substring false positives occur', () => {
    // Under strict word boundary matching:
    // 'cabinet' should NOT match 'cab' (Travel)
    // 'swiggyy' should NOT match 'swiggy' (Food)
    // 'petroleum' should NOT match 'petrol' (Travel)
    // 'billionaire' should NOT match 'bill' (Bills)
    // 'rechargeable' should NOT match 'recharge' (Bills)
    // 'transparent' should NOT match 'rent' (Bills)
    // 'parent' should NOT match 'rent' (Bills)
    // 'current' should NOT match 'rent' (Bills)
    // 'cinematography' should NOT match 'cinema' (Entertainment)
    // 'metropolitan' should NOT match 'metro' (Travel)

    const falsePositiveChecks = [
      { text: 'cabinet', target: 'Other', bugIfCategory: 'Travel' },
      { text: 'swiggyy', target: 'Other', bugIfCategory: 'Food' },
      { text: 'petroleum', target: 'Other', bugIfCategory: 'Travel' },
      { text: 'billionaire biography', target: 'Other', bugIfCategory: 'Bills' },
      { text: 'rechargeable battery', target: 'Other', bugIfCategory: 'Bills' },
      { text: 'transparent phone case', target: 'Other', bugIfCategory: 'Bills' },
      { text: 'parenting advice book', target: 'Other', bugIfCategory: 'Bills' },
      { text: 'current affairs magazine', target: 'Other', bugIfCategory: 'Bills' },
      { text: 'cinematography festival', target: 'Other', bugIfCategory: 'Entertainment' },
      { text: 'metropolitan museum ticket', target: 'Other', bugIfCategory: 'Travel' },
    ];

    for (const item of falsePositiveChecks) {
      const res = detectCategoryFromKeyword(item.text);
      // We expect the category to NOT falsely match the keyword category:
      expect(res.category).not.toBe(item.bugIfCategory);
    }
  });
});

describe('Empirical Stress Testing: Split Ledger Math', () => {
  it('conserves exact penny remainder across 2, 3, 5, 7 member splits', () => {
    const testCases = [
      { amount: 100.01, members: ['You', 'Rahul'] },                         // 2 members
      { amount: 100.00, members: ['You', 'Rahul', 'Priya'] },                // 3 members
      { amount: 100.01, members: ['You', 'Rahul', 'Priya'] },                // 3 members (0.02 remainder)
      { amount: 100.03, members: ['M1', 'M2', 'M3', 'M4', 'M5'] },           // 5 members
      { amount: 100.00, members: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'] }, // 7 members (100 / 7)
      { amount: 1000.50, members: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'] },// 7 members decimal
      { amount: 0.01, members: ['You', 'Rahul', 'Priya'] },                  // Fractional penny
    ];

    for (const tc of testCases) {
      const allocations = calculateEqualSplit(tc.amount, tc.members);
      expect(allocations).toHaveLength(tc.members.length);

      const sum = allocations.reduce((acc, curr) => acc + curr.amount, 0);
      // Strictly equals the total expense without losing or creating a penny
      expect(Math.round(sum * 100) / 100).toBe(tc.amount);
    }
  });

  it('settlements clear debts completely and maintain net balance conservation', () => {
    const members = ['You', 'Alice', 'Bob'];
    const expenses: SplitExpense[] = [
      {
        id: 'e1',
        groupId: 'g1',
        description: 'Dinner',
        amount: 300,
        paidBy: 'You',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 100 },
          { member: 'Alice', amount: 100 },
          { member: 'Bob', amount: 100 },
        ],
        date: '2026-09-01',
      },
    ];

    // Initial balances before settlements:
    const initialBalances = calculateGroupBalances(members, expenses, []);
    const youInit = initialBalances.find((b) => b.member === 'You');
    const aliceInit = initialBalances.find((b) => b.member === 'Alice');
    const bobInit = initialBalances.find((b) => b.member === 'Bob');

    expect(youInit?.netBalance).toBe(200);   // You are owed 200
    expect(aliceInit?.netBalance).toBe(-100); // Alice owes 100
    expect(bobInit?.netBalance).toBe(-100);   // Bob owes 100

    // Alice settles 100 with You
    const settlements: Settlement[] = [
      {
        id: 's1',
        groupId: 'g1',
        fromMember: 'Alice',
        toMember: 'You',
        amount: 100,
        date: '2026-09-02',
      },
    ];

    const afterAliceSettles = calculateGroupBalances(members, expenses, settlements);
    const aliceAfter = afterAliceSettles.find((b) => b.member === 'Alice');
    const youAfter = afterAliceSettles.find((b) => b.member === 'You');
    const bobAfter = afterAliceSettles.find((b) => b.member === 'Bob');

    expect(aliceAfter?.netBalance).toBe(0); // Alice debt is cleared
    expect(youAfter?.netBalance).toBe(100); // You are still owed 100 by Bob
    expect(bobAfter?.netBalance).toBe(-100);

    // Bob settles 100 with You
    settlements.push({
      id: 's2',
      groupId: 'g1',
      fromMember: 'Bob',
      toMember: 'You',
      amount: 100,
      date: '2026-09-03',
    });

    const fullySettled = calculateGroupBalances(members, expenses, settlements);
    for (const mb of fullySettled) {
      expect(mb.netBalance).toBe(0); // Everyone is fully settled!
    }

    // Ledger net sum must be exactly 0
    const totalNet = fullySettled.reduce((s, b) => s + b.netBalance, 0);
    expect(totalNet).toBe(0);
  });

  it('consolidates balances across multiple groups correctly', () => {
    const groups: SplitGroup[] = [
      { id: 'g1', name: 'Apartment', members: ['You', 'Alice'], createdAt: '2026-09-01' },
      { id: 'g2', name: 'Trip', members: ['You', 'Bob'], createdAt: '2026-09-02' },
    ];

    const expenses: SplitExpense[] = [
      // In g1, You paid 200, split 100 each -> Alice owes You 100 (others owe you 100)
      {
        id: 'e1',
        groupId: 'g1',
        description: 'Groceries',
        amount: 200,
        paidBy: 'You',
        splitType: 'equal',
        allocations: [{ member: 'You', amount: 100 }, { member: 'Alice', amount: 100 }],
        date: '2026-09-01',
      },
      // In g2, Bob paid 300, split 150 each -> You owe Bob 150 (you owe 150)
      {
        id: 'e2',
        groupId: 'g2',
        description: 'Hotel',
        amount: 300,
        paidBy: 'Bob',
        splitType: 'equal',
        allocations: [{ member: 'You', amount: 150 }, { member: 'Bob', amount: 150 }],
        date: '2026-09-02',
      },
    ];

    const summary = calculateSplitLedgerSummary(groups, expenses, []);
    expect(summary.totalOthersOweYou).toBe(100);
    expect(summary.totalYouOwe).toBe(150);
    expect(summary.netBalance).toBe(-50);
  });
});
