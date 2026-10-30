import { describe, it, expect } from 'vitest';
import {
  calculateGroupBalances,
  calculateSimplifiedDebts,
  calculateSplitLedgerSummary,
  calculateEqualSplit,
} from './splitLedger';
import { SplitExpense, Settlement, SplitGroup } from '../types/finance';

describe('Split Ledger & Who Owes Whom Calculations', () => {
  it('correctly calculates who owes whom when A pays 300 for group of A, B, C', () => {
    const members = ['A', 'B', 'C'];
    const allocations = calculateEqualSplit(300, members);

    expect(allocations).toEqual([
      { member: 'A', amount: 100 },
      { member: 'B', amount: 100 },
      { member: 'C', amount: 100 },
    ]);

    const expenses: SplitExpense[] = [
      {
        id: 'exp-1',
        groupId: 'group-1',
        description: 'Dinner',
        amount: 300,
        paidBy: 'A',
        splitType: 'equal',
        allocations,
        date: '2026-10-31',
      },
    ];

    const balances = calculateGroupBalances(members, expenses, []);

    // Check balances
    const balA = balances.find((b) => b.member === 'A')!;
    const balB = balances.find((b) => b.member === 'B')!;
    const balC = balances.find((b) => b.member === 'C')!;

    expect(balA.paid).toBe(300);
    expect(balA.share).toBe(100);
    expect(balA.netBalance).toBe(200);

    expect(balB.paid).toBe(0);
    expect(balB.share).toBe(100);
    expect(balB.netBalance).toBe(-100);

    expect(balC.paid).toBe(0);
    expect(balC.share).toBe(100);
    expect(balC.netBalance).toBe(-100);

    // Check simplified debts ("Who owes whom")
    const debts = calculateSimplifiedDebts(balances);
    expect(debts).toHaveLength(2);
    expect(debts).toContainEqual({ from: 'B', to: 'A', amount: 100 });
    expect(debts).toContainEqual({ from: 'C', to: 'A', amount: 100 });

    // Check per-member debts
    expect(balA.owedBy).toContainEqual({ from: 'B', to: 'A', amount: 100 });
    expect(balA.owedBy).toContainEqual({ from: 'C', to: 'A', amount: 100 });
    expect(balA.owesTo).toHaveLength(0);

    expect(balB.owesTo).toContainEqual({ from: 'B', to: 'A', amount: 100 });
    expect(balB.owedBy).toHaveLength(0);

    expect(balC.owesTo).toContainEqual({ from: 'C', to: 'A', amount: 100 });
    expect(balC.owedBy).toHaveLength(0);
  });

  it('updates debts after a settlement is recorded', () => {
    const members = ['A', 'B', 'C'];
    const expenses: SplitExpense[] = [
      {
        id: 'exp-1',
        groupId: 'group-1',
        description: 'Dinner',
        amount: 300,
        paidBy: 'A',
        splitType: 'equal',
        allocations: [
          { member: 'A', amount: 100 },
          { member: 'B', amount: 100 },
          { member: 'C', amount: 100 },
        ],
        date: '2026-10-31',
      },
    ];

    // B settles 100 with A
    const settlements: Settlement[] = [
      {
        id: 'set-1',
        groupId: 'group-1',
        fromMember: 'B',
        toMember: 'A',
        amount: 100,
        date: '2026-10-31',
      },
    ];

    const balances = calculateGroupBalances(members, expenses, settlements);

    const balA = balances.find((b) => b.member === 'A')!;
    const balB = balances.find((b) => b.member === 'B')!;
    const balC = balances.find((b) => b.member === 'C')!;

    expect(balA.netBalance).toBe(100);
    expect(balB.netBalance).toBe(0);
    expect(balC.netBalance).toBe(-100);

    const debts = calculateSimplifiedDebts(balances);
    expect(debts).toEqual([{ from: 'C', to: 'A', amount: 100 }]);
  });

  it('correctly populates groupDebts in calculateSplitLedgerSummary', () => {
    const group: SplitGroup = {
      id: 'grp-1',
      name: 'Friends Trip',
      members: ['You', 'Aman', 'Sneha'],
      createdAt: '2026-10-31',
    };

    const expenses: SplitExpense[] = [
      {
        id: 'exp-1',
        groupId: 'grp-1',
        description: 'Hotel Stay',
        amount: 900,
        paidBy: 'You',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 300 },
          { member: 'Aman', amount: 300 },
          { member: 'Sneha', amount: 300 },
        ],
        date: '2026-10-31',
      },
    ];

    const summary = calculateSplitLedgerSummary([group], expenses, []);
    expect(summary.totalOthersOweYou).toBe(600);
    expect(summary.totalYouOwe).toBe(0);
    expect(summary.groupDebts?.['grp-1']).toHaveLength(2);
    expect(summary.groupDebts?.['grp-1']).toContainEqual({ from: 'Aman', to: 'You', amount: 300 });
    expect(summary.groupDebts?.['grp-1']).toContainEqual({ from: 'Sneha', to: 'You', amount: 300 });
  });
});
