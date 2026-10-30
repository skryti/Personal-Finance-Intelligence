import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Plus,
  Users,
  PieChart as PieChartIcon,
  SlidersHorizontal,
  ChevronRight,
  Utensils,
  ShoppingBag,
  Plane,
  Receipt,
  Film,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TransactionCategory } from '../../types/finance';

export const DashboardView: React.FC = () => {
  const {
    summary,
    categorySpending,
    monthlyData,
    transactions,
    splitSummary,
    setActiveTab,
    setAddTransactionOpen,
    setAddSplitExpenseOpen,
  } = useFinance();

  const [donutFilter, setDonutFilter] = useState<'month' | '30days'>('month');

  // Category Icon helper
  const getCategoryIcon = (category: TransactionCategory) => {
    switch (category) {
      case 'Food':
        return <Utensils className="w-3.5 h-3.5 text-amber-500" />;
      case 'Shopping':
        return <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />;
      case 'Travel':
        return <Plane className="w-3.5 h-3.5 text-blue-500" />;
      case 'Bills':
        return <Receipt className="w-3.5 h-3.5 text-purple-500" />;
      case 'Entertainment':
        return <Film className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 1. Top 4 Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Balance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(summary.totalBalance)}
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Available liquid funds</p>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Income
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-emerald-600 tracking-tight">
              {formatCurrency(summary.totalIncome)}
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Current cycle inflows</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Expenses
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-rose-600 tracking-tight">
              {formatCurrency(summary.totalExpenses)}
            </h3>
            <p className="mt-1 text-xs text-slate-400 font-medium">Current cycle outflows</p>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Savings
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-indigo-600 tracking-tight">
              {formatCurrency(summary.savings)}
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                {summary.savingsRate}%
              </span>
              <span className="text-xs text-slate-400 font-medium">savings rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Spending Donut, Monthly Overview Bar Chart, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending by Category Donut Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Spending by Category</h4>
              <p className="text-xs text-slate-400">Distribution across active budget categories</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setDonutFilter('month')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  donutFilter === 'month'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setDonutFilter('30days')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  donutFilter === '30days'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                30D
              </button>
            </div>
          </div>

          {/* Donut Chart with Center Total Spent */}
          <div className="relative h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySpending}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {categorySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Label Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-medium text-slate-400">Total Spent</span>
              <span className="text-xl font-bold text-slate-900">
                {formatCurrency(summary.totalExpenses)}
              </span>
            </div>
          </div>

          {/* Category breakdown legend */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
            {categorySpending.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-600 font-medium truncate">{cat.category}</span>
                </div>
                <span className="font-semibold text-slate-900 ml-1">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Overview Grouped Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Monthly Overview</h4>
              <p className="text-xs text-slate-400">Comparing Inflow vs Outflow</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg">
              Jul - Sep
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#F43F5E"
                  radius={[6, 6, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average Monthly Savings</span>
            <span className="font-bold text-slate-900">₹22,833</span>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Quick Actions</h4>
            <p className="text-xs text-slate-400 mb-6">Frequently used financial operations</p>

            <div className="space-y-3">
              <button
                onClick={() => setAddTransactionOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Add Transaction
                    </h5>
                    <p className="text-[11px] text-slate-400">Log new income or personal expense</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </button>

              <button
                onClick={() => setAddSplitExpenseOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Create Split Bill
                    </h5>
                    <p className="text-[11px] text-slate-400">Split dinner or travel with flatmates</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <PieChartIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      View Analytics
                    </h5>
                    <p className="text-[11px] text-slate-400">Deep-dive category trends & insights</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 bg-slate-50/60 hover:bg-indigo-50/50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                      Set Budgets
                    </h5>
                    <p className="text-[11px] text-slate-400">Configure category spending thresholds</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">All data automatically syncs locally</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Recent Transactions Table, Split Bills Quick Card, Recent Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Recent Transactions</h4>
                <p className="text-xs text-slate-400">Latest activity across personal accounts</p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 text-slate-500 whitespace-nowrap">{formatDate(tx.date)}</td>
                      <td className="py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-slate-100">
                            {getCategoryIcon(tx.category)}
                          </span>
                          <span className="truncate max-w-[200px]">{tx.description}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                          {tx.category}
                        </span>
                      </td>
                      <td
                        className={`py-3 text-right font-bold whitespace-nowrap ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            tx.type === 'income'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side: Split Bills Quick Card & Recent Insights */}
        <div className="space-y-6">
          {/* Split Bills Quick Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Split Bills Ledger</h4>
                  <p className="text-[11px] text-slate-400">Group expense net position</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('split-bills')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Open
              </button>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100/60 my-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                Net Status
              </span>
              <h3 className="text-xl font-extrabold text-emerald-700 mt-0.5">
                You are owed {formatCurrency(splitSummary.totalOthersOweYou)}
              </h3>
              <p className="text-xs text-emerald-600/90 mt-1 font-medium">
                Apartment Flatmates • Rahul owes {formatCurrency(200)}
              </p>
            </div>

            <button
              onClick={() => setActiveTab('split-bills')}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Manage Groups & Settle Up
            </button>
          </div>

          {/* Recent Insights Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-sm">Financial Insights</h4>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold shrink-0">🎯</span>
                <span>
                  High savings rate: <strong className="text-slate-900">{summary.savingsRate}%</strong> of income saved this month.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 font-bold shrink-0">🍔</span>
                <span>
                  <strong className="text-slate-900">Food</strong> is your primary expense at <strong className="text-slate-900">₹2,100</strong> (38.2%).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-500 font-bold shrink-0">👥</span>
                <span>
                  Pending collection: <strong className="text-slate-900">₹200</strong> in split groups.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
