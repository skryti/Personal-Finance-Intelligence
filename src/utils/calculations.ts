import { Transaction, FinancialSummary, CategorySpending, MonthlyOverviewPoint } from '../types/finance';

export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount);
    if (!isNaN(amt)) {
      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpenses += amt;
      }
    }
  }

  const totalBalance = totalIncome - totalExpenses;
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((savings / totalIncome) * 1000) / 10) : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    savings,
    savingsRate,
  };
}

export function calculateCategorySpending(transactions: Transaction[]): CategorySpending[] {
  const expenseMap: Record<string, number> = {};
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount);
      if (!isNaN(amt)) {
        expenseMap[tx.category] = (expenseMap[tx.category] || 0) + amt;
        totalExpense += amt;
      }
    }
  }

  const categoryColors: Record<string, string> = {
    Food: '#F59E0B',         // Amber 500
    Shopping: '#EC4899',     // Pink 500
    Travel: '#3B82F6',       // Blue 500
    Bills: '#8B5CF6',        // Purple 500
    Entertainment: '#10B981',// Emerald 500
    Other: '#64748B',        // Slate 500
    Income: '#10B981',
  };

  return Object.entries(expenseMap).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0,
    color: categoryColors[category] || '#6366F1',
  }));
}

export function calculateMonthlyData(transactions: Transaction[]): MonthlyOverviewPoint[] {
  if (!transactions || transactions.length === 0) return [];

  // Group by year-month e.g. "2026-10"
  const monthMap: Record<string, { income: number; expenses: number; label: string }> = {};

  // Sort chronological for grouping
  const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const tx of sorted) {
    const d = new Date(tx.date);
    const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount);
    if (isNaN(amt)) continue;

    const key = isNaN(d.getTime()) ? 'Unknown' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = isNaN(d.getTime()) ? 'Other' : d.toLocaleDateString('en-US', { month: 'short' });

    if (!monthMap[key]) {
      monthMap[key] = { income: 0, expenses: 0, label: monthLabel };
    }
    if (tx.type === 'income') {
      monthMap[key].income += amt;
    } else {
      monthMap[key].expenses += amt;
    }
  }

  return Object.keys(monthMap).map((key) => {
    const item = monthMap[key];
    const savings = item.income - item.expenses;
    return {
      month: item.label,
      income: item.income,
      expenses: item.expenses,
      savings,
    };
  });
}
