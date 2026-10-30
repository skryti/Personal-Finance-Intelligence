import { Transaction, FinancialSummary, CategorySpending, TransactionCategory } from '../types/finance';

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

export function calculateCategorySpending(transactions: Transaction[]): CategorySpending[] {
  const expenseMap: Record<string, number> = {};
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      expenseMap[tx.category] = (expenseMap[tx.category] || 0) + tx.amount;
      totalExpense += tx.amount;
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
    category: category as TransactionCategory,
    amount,
    percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 1000) / 10 : 0,
    color: categoryColors[category] || '#94A3B8',
  }));
}
