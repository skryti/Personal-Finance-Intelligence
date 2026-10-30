import { describe, it, expect } from 'vitest';
import {
  calculateEqualSplit,
  calculateGroupBalances,
  calculateSplitLedgerSummary,
} from '../utils/splitLedger';
import {
  INITIAL_GROUPS,
  INITIAL_SPLIT_EXPENSES,
  INITIAL_SETTLEMENTS,
} from '../data/initialMockData';
import { SplitGroup, SplitExpense, Settlement } from '../types/finance';

describe('Split Ledger Engine', () => {
  // ==========================================
  // TIER 1: ISOLATED LEDGER & BALANCE MATH
  // ==========================================
  describe('Tier 1: Isolated Equal Split and Balance Calculations', () => {
    it('divides expenses equally without rounding errors among 3 members', () => {
      const allocations = calculateEqualSplit(600, ['You', 'Rahul', 'Priya']);
      expect(allocations).toHaveLength(3);
      expect(allocations.map((a) => a.amount)).toEqual([200, 200, 200]);
      expect(allocations.reduce((sum, a) => sum + a.amount, 0)).toBe(600);
    });

    it('divides expenses equally between 2 members', () => {
      const allocations = calculateEqualSplit(500, ['You', 'Alex']);
      expect(allocations).toEqual([
        { member: 'You', amount: 250 },
        { member: 'Alex', amount: 250 },
      ]);
    });

    it('computes correct group balances for a single expense paid by You', () => {
      const expense: SplitExpense = {
        id: 'e1',
        groupId: 'g1',
        description: 'Dinner',
        amount: 300,
        paidBy: 'You',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 100 },
          { member: 'Rahul', amount: 100 },
          { member: 'Priya', amount: 100 },
        ],
        date: '2026-10-01',
      };

      const balances = calculateGroupBalances(['You', 'Rahul', 'Priya'], [expense], []);

      const you = balances.find((b) => b.member === 'You');
      const rahul = balances.find((b) => b.member === 'Rahul');
      const priya = balances.find((b) => b.member === 'Priya');

      expect(you?.paid).toBe(300);
      expect(you?.share).toBe(100);
      expect(you?.netBalance).toBe(200); // You are owed 200

      expect(rahul?.paid).toBe(0);
      expect(rahul?.share).toBe(100);
      expect(rahul?.netBalance).toBe(-100); // Rahul owes 100

      expect(priya?.paid).toBe(0);
      expect(priya?.share).toBe(100);
      expect(priya?.netBalance).toBe(-100); // Priya owes 100
    });

    it('computes correct group balances when someone else pays', () => {
      const expense: SplitExpense = {
        id: 'e1',
        groupId: 'g1',
        description: 'Groceries',
        amount: 300,
        paidBy: 'Rahul',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 100 },
          { member: 'Rahul', amount: 100 },
          { member: 'Priya', amount: 100 },
        ],
        date: '2026-10-01',
      };

      const balances = calculateGroupBalances(['You', 'Rahul', 'Priya'], [expense], []);

      const you = balances.find((b) => b.member === 'You');
      const rahul = balances.find((b) => b.member === 'Rahul');

      expect(you?.netBalance).toBe(-100); // You owe Rahul 100
      expect(rahul?.netBalance).toBe(200); // Rahul is owed 200
    });

    it('matches R2 and R5 split ledger requirements ("You are owed ₹200") in mock data', () => {
      const summary = calculateSplitLedgerSummary(
        INITIAL_GROUPS,
        INITIAL_SPLIT_EXPENSES,
        INITIAL_SETTLEMENTS
      );

      expect(summary.totalOthersOweYou).toBe(200);
      expect(summary.totalYouOwe).toBe(0);
      expect(summary.netBalance).toBe(200);

      const flatmatesBalances = summary.groupBalances['grp-1'];
      expect(flatmatesBalances).toBeDefined();

      const you = flatmatesBalances.find((b) => b.member === 'You');
      const rahul = flatmatesBalances.find((b) => b.member === 'Rahul');
      const priya = flatmatesBalances.find((b) => b.member === 'Priya');

      expect(you?.netBalance).toBe(200);   // You are owed 200
      expect(rahul?.netBalance).toBe(-200); // Rahul owes 200
      expect(priya?.netBalance).toBe(0);    // Priya is settled up
    });

    it('applies settlements properly to reduce debtor liability and creditor credit', () => {
      const expense: SplitExpense = {
        id: 'e1',
        groupId: 'g1',
        description: 'Lunch',
        amount: 200,
        paidBy: 'You',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 100 },
          { member: 'Rahul', amount: 100 },
        ],
        date: '2026-10-01',
      };

      const settlement: Settlement = {
        id: 's1',
        groupId: 'g1',
        fromMember: 'Rahul',
        toMember: 'You',
        amount: 100,
        date: '2026-10-02',
      };

      const balances = calculateGroupBalances(['You', 'Rahul'], [expense], [settlement]);
      const you = balances.find((b) => b.member === 'You');
      const rahul = balances.find((b) => b.member === 'Rahul');

      expect(you?.netBalance).toBe(0);
      expect(rahul?.netBalance).toBe(0);
    });

    it('supports custom allocations where members pay unequal amounts', () => {
      const expense: SplitExpense = {
        id: 'e-custom',
        groupId: 'g1',
        description: 'Road trip supplies',
        amount: 500,
        paidBy: 'You',
        splitType: 'custom',
        allocations: [
          { member: 'You', amount: 100 },
          { member: 'Rahul', amount: 250 },
          { member: 'Priya', amount: 150 },
        ],
        date: '2026-10-05',
      };

      const balances = calculateGroupBalances(['You', 'Rahul', 'Priya'], [expense], []);
      const you = balances.find((b) => b.member === 'You');
      const rahul = balances.find((b) => b.member === 'Rahul');
      const priya = balances.find((b) => b.member === 'Priya');

      expect(you?.netBalance).toBe(400); // 500 paid - 100 share
      expect(rahul?.netBalance).toBe(-250);
      expect(priya?.netBalance).toBe(-150);
    });
  });

  // ==========================================
  // TIER 2: BOUNDARY VALUE ANALYSIS
  // ==========================================
  describe('Tier 2: Boundary Value Analysis', () => {
    it('returns empty array when calculateEqualSplit receives empty members list', () => {
      const allocations = calculateEqualSplit(100, []);
      expect(allocations).toEqual([]);
    });

    it('handles zero amount equal split correctly', () => {
      const allocations = calculateEqualSplit(0, ['You', 'Rahul']);
      expect(allocations).toEqual([
        { member: 'You', amount: 0 },
        { member: 'Rahul', amount: 0 },
      ]);
    });

    it('handles 1 member group equal split (split with self)', () => {
      const allocations = calculateEqualSplit(150, ['You']);
      expect(allocations).toEqual([{ member: 'You', amount: 150 }]);
    });

    it('conserves penny rounding when dividing 100 among 3 members (33.34, 33.33, 33.33)', () => {
      const allocations = calculateEqualSplit(100, ['You', 'Rahul', 'Priya']);
      expect(allocations[0].amount).toBe(33.34);
      expect(allocations[1].amount).toBe(33.33);
      expect(allocations[2].amount).toBe(33.33);

      const sum = allocations.reduce((acc, curr) => acc + curr.amount, 0);
      expect(Math.round(sum * 100) / 100).toBe(100);
    });

    it('conserves penny rounding when dividing 1000 among 7 members', () => {
      const members = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'];
      const allocations = calculateEqualSplit(1000, members);
      const sum = allocations.reduce((acc, curr) => acc + curr.amount, 0);
      expect(Math.round(sum * 100) / 100).toBe(1000);
    });

    it('conserves penny rounding when dividing 1 rupee among 3 members (0.34, 0.33, 0.33)', () => {
      const allocations = calculateEqualSplit(1, ['A', 'B', 'C']);
      expect(allocations[0].amount).toBe(0.34);
      expect(allocations[1].amount).toBe(0.33);
      expect(allocations[2].amount).toBe(0.33);
      const sum = allocations.reduce((acc, curr) => acc + curr.amount, 0);
      expect(Math.round(sum * 100) / 100).toBe(1);
    });

    it('handles group with zero expenses and zero settlements', () => {
      const balances = calculateGroupBalances(['You', 'Rahul'], [], []);
      expect(balances).toEqual([
        { member: 'You', paid: 0, share: 0, netBalance: 0 },
        { member: 'Rahul', paid: 0, share: 0, netBalance: 0 },
      ]);
    });

    it('handles partial settlement payments', () => {
      const expense: SplitExpense = {
        id: 'e1',
        groupId: 'g1',
        description: 'Dinner',
        amount: 200,
        paidBy: 'You',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 100 },
          { member: 'Rahul', amount: 100 },
        ],
        date: '2026-10-01',
      };

      // Rahul owes 100, pays 40 first
      const partialSettlement: Settlement = {
        id: 's1',
        groupId: 'g1',
        fromMember: 'Rahul',
        toMember: 'You',
        amount: 40,
        date: '2026-10-02',
      };

      const balances = calculateGroupBalances(['You', 'Rahul'], [expense], [partialSettlement]);
      const you = balances.find((b) => b.member === 'You');
      const rahul = balances.find((b) => b.member === 'Rahul');

      expect(you?.netBalance).toBe(60);
      expect(rahul?.netBalance).toBe(-60);
    });

    it('handles over-settlement (paying more than owed, reversing roles)', () => {
      const expense: SplitExpense = {
        id: 'e1',
        groupId: 'g1',
        description: 'Snacks',
        amount: 100,
        paidBy: 'You',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 50 },
          { member: 'Rahul', amount: 50 },
        ],
        date: '2026-10-01',
      };

      // Rahul owes 50, but pays 80
      const overSettlement: Settlement = {
        id: 's1',
        groupId: 'g1',
        fromMember: 'Rahul',
        toMember: 'You',
        amount: 80,
        date: '2026-10-02',
      };

      const balances = calculateGroupBalances(['You', 'Rahul'], [expense], [overSettlement]);
      const you = balances.find((b) => b.member === 'You');
      const rahul = balances.find((b) => b.member === 'Rahul');

      expect(you?.netBalance).toBe(-30);  // You now owe Rahul 30
      expect(rahul?.netBalance).toBe(30);  // Rahul is owed 30
    });
  });

  // ==========================================
  // TIER 3: MULTI-GROUP CONSOLIDATION
  // ==========================================
  describe('Tier 3: Multi-Group Consolidation & Cross-Group Ledger', () => {
    it('consolidates balances across multiple groups accurately', () => {
      const group1: SplitGroup = {
        id: 'grp-a',
        name: 'Group A',
        members: ['You', 'Alice'],
        createdAt: '2026-10-01',
      };
      const group2: SplitGroup = {
        id: 'grp-b',
        name: 'Group B',
        members: ['You', 'Bob'],
        createdAt: '2026-10-01',
      };

      // In Group A, You paid 200, Alice owes You 100
      const expA: SplitExpense = {
        id: 'ea',
        groupId: 'grp-a',
        description: 'Dinner A',
        amount: 200,
        paidBy: 'You',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 100 },
          { member: 'Alice', amount: 100 },
        ],
        date: '2026-10-01',
      };

      // In Group B, Bob paid 300, You owe Bob 150
      const expB: SplitExpense = {
        id: 'eb',
        groupId: 'grp-b',
        description: 'Stay B',
        amount: 300,
        paidBy: 'Bob',
        splitType: 'equal',
        allocations: [
          { member: 'You', amount: 150 },
          { member: 'Bob', amount: 150 },
        ],
        date: '2026-10-02',
      };

      const summary = calculateSplitLedgerSummary([group1, group2], [expA, expB], []);

      expect(summary.totalOthersOweYou).toBe(100); // Alice owes 100
      expect(summary.totalYouOwe).toBe(150);       // You owe Bob 150
      expect(summary.netBalance).toBe(-50);        // 100 - 150 = -50
    });

    it('calculates summary when You have 0 balance across groups', () => {
      const group: SplitGroup = {
        id: 'g-even',
        name: 'Even Group',
        members: ['You', 'Sam'],
        createdAt: '2026-10-01',
      };
      const summary = calculateSplitLedgerSummary([group], [], []);
      expect(summary.totalYouOwe).toBe(0);
      expect(summary.totalOthersOweYou).toBe(0);
      expect(summary.netBalance).toBe(0);
    });
  });

  // ==========================================
  // TIER 5: ADVERSARIAL CONSERVATION INVARIANTS
  // ==========================================
  describe('Tier 5: Mathematical Invariants & Stress Testing', () => {
    it('preserves conservation invariant: sum of net balances is zero in mock data', () => {
      const balances = calculateGroupBalances(
        ['You', 'Rahul', 'Priya'],
        INITIAL_SPLIT_EXPENSES,
        INITIAL_SETTLEMENTS
      );

      const totalNet = balances.reduce((sum, b) => sum + b.netBalance, 0);
      expect(Math.abs(totalNet)).toBeLessThanOrEqual(0.01);
    });

    it('preserves conservation invariant across 10 random interleaved expenses and settlements', () => {
      const members = ['You', 'User1', 'User2', 'User3', 'User4'];
      const expenses: SplitExpense[] = [];
      const settlements: Settlement[] = [];

      // Interleave multiple expenses
      for (let i = 1; i <= 8; i++) {
        const payer = members[i % members.length];
        const amount = 50 * i + 17.5;
        expenses.push({
          id: `exp-${i}`,
          groupId: 'grp-stress',
          description: `Stress expense ${i}`,
          amount,
          paidBy: payer,
          splitType: 'equal',
          allocations: calculateEqualSplit(amount, members),
          date: '2026-10-01',
        });
      }

      // Add settlements
      settlements.push({
        id: 'set-1',
        groupId: 'grp-stress',
        fromMember: 'User1',
        toMember: 'You',
        amount: 85.5,
        date: '2026-10-02',
      });
      settlements.push({
        id: 'set-2',
        groupId: 'grp-stress',
        fromMember: 'User2',
        toMember: 'User3',
        amount: 42.0,
        date: '2026-10-03',
      });

      const balances = calculateGroupBalances(members, expenses, settlements);
      const sumNetBalances = balances.reduce((acc, b) => acc + b.netBalance, 0);

      // In any closed financial group, the sum of all net debts and credits must equal 0 exactly
      expect(Math.abs(sumNetBalances)).toBeLessThanOrEqual(0.01);
    });

    it('is order-independent: shuffling expenses and settlements produces identical net balances', () => {
      const members = ['You', 'A', 'B'];
      const e1: SplitExpense = {
        id: '1', groupId: 'g', description: 'A', amount: 150, paidBy: 'You', splitType: 'equal',
        allocations: [{ member: 'You', amount: 50 }, { member: 'A', amount: 50 }, { member: 'B', amount: 50 }],
        date: '2026-10-01',
      };
      const e2: SplitExpense = {
        id: '2', groupId: 'g', description: 'B', amount: 90, paidBy: 'A', splitType: 'equal',
        allocations: [{ member: 'You', amount: 30 }, { member: 'A', amount: 30 }, { member: 'B', amount: 30 }],
        date: '2026-10-02',
      };
      const s1: Settlement = { id: 's1', groupId: 'g', fromMember: 'B', toMember: 'You', amount: 50, date: '2026-10-03' };

      const balancesForward = calculateGroupBalances(members, [e1, e2], [s1]);
      const balancesReversed = calculateGroupBalances(members, [e2, e1], [s1]);

      expect(balancesForward).toEqual(balancesReversed);
    });
  });
});
