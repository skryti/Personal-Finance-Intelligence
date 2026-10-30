import {
  SplitExpense,
  Settlement,
  MemberBalance,
  SplitGroup,
  SplitLedgerSummary,
  SplitAllocation,
  GroupDebt,
} from '../types/finance';

export function calculateSimplifiedDebts(
  balances: { member: string; netBalance: number }[]
): GroupDebt[] {
  // Extract debtors (netBalance < 0) and creditors (netBalance > 0)
  const debtors = balances
    .filter((b) => b.netBalance < -0.009)
    .map((b) => ({ member: b.member, amount: Math.abs(b.netBalance) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter((b) => b.netBalance > 0.009)
    .map((b) => ({ member: b.member, amount: b.netBalance }))
    .sort((a, b) => b.amount - a.amount);

  const debts: GroupDebt[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    const payment = Math.min(debtor.amount, creditor.amount);

    if (payment > 0.009) {
      debts.push({
        from: debtor.member,
        to: creditor.member,
        amount: Math.round(payment * 100) / 100,
      });
    }

    debtor.amount = Math.round((debtor.amount - payment) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - payment) * 100) / 100;

    if (debtor.amount <= 0.009) {
      d++;
    }
    if (creditor.amount <= 0.009) {
      c++;
    }
  }

  return debts;
}

export function calculateGroupBalances(
  members: string[],
  expenses: SplitExpense[],
  settlements: Settlement[]
): MemberBalance[] {
  const paidMap: Record<string, number> = {};
  const shareMap: Record<string, number> = {};

  for (const m of members) {
    paidMap[m] = 0;
    shareMap[m] = 0;
  }

  for (const exp of expenses) {
    paidMap[exp.paidBy] = (paidMap[exp.paidBy] || 0) + exp.amount;
    for (const alloc of exp.allocations) {
      shareMap[alloc.member] = (shareMap[alloc.member] || 0) + alloc.amount;
    }
  }

  for (const set of settlements) {
    paidMap[set.fromMember] = (paidMap[set.fromMember] || 0) + set.amount;
    paidMap[set.toMember] = (paidMap[set.toMember] || 0) - set.amount;
  }

  const rawBalances = members.map((member) => {
    const paid = paidMap[member] || 0;
    const share = shareMap[member] || 0;
    const netBalance = Math.round((paid - share) * 100) / 100;
    return {
      member,
      paid,
      share,
      netBalance,
    };
  });

  const groupDebts = calculateSimplifiedDebts(rawBalances);

  return rawBalances.map((rb) => ({
    ...rb,
    owesTo: groupDebts.filter((d) => d.from === rb.member),
    owedBy: groupDebts.filter((d) => d.to === rb.member),
  }));
}

export function calculateSplitLedgerSummary(
  groups: SplitGroup[],
  expenses: SplitExpense[],
  settlements: Settlement[]
): SplitLedgerSummary {
  let totalYouOwe = 0;
  let totalOthersOweYou = 0;
  const groupBalances: Record<string, MemberBalance[]> = {};
  const groupDebts: Record<string, GroupDebt[]> = {};

  for (const group of groups) {
    const groupExpenses = expenses.filter((e) => e.groupId === group.id);
    const groupSettlements = settlements.filter((s) => s.groupId === group.id);
    const balances = calculateGroupBalances(group.members, groupExpenses, groupSettlements);
    groupBalances[group.id] = balances;

    const debts = calculateSimplifiedDebts(balances);
    groupDebts[group.id] = debts;

    const youBalance = balances.find((b) => b.member === 'You');
    if (youBalance) {
      if (youBalance.netBalance > 0) {
        totalOthersOweYou += youBalance.netBalance;
      } else if (youBalance.netBalance < 0) {
        totalYouOwe += Math.abs(youBalance.netBalance);
      }
    }
  }

  return {
    totalYouOwe: Math.round(totalYouOwe * 100) / 100,
    totalOthersOweYou: Math.round(totalOthersOweYou * 100) / 100,
    netBalance: Math.round((totalOthersOweYou - totalYouOwe) * 100) / 100,
    groupBalances,
    groupDebts,
  };
}

export function calculateEqualSplit(amount: number, members: string[]): SplitAllocation[] {
  if (members.length === 0) return [];
  const baseShare = Math.floor((amount / members.length) * 100) / 100;
  const remainder = Math.round((amount - baseShare * members.length) * 100) / 100;

  return members.map((member, index) => ({
    member,
    amount: index === 0 ? Math.round((baseShare + remainder) * 100) / 100 : baseShare,
  }));
}
