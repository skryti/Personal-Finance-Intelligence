import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ShieldCheck,
  Wallet,
  Plus,
  Inbox,
  BarChart3,
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
import { formatCurrency } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const { summary, categorySpending, monthlyData, transactions, setAddTransactionOpen } = useFinance();

  // Find highest expense category
  const sortedCategories = [...categorySpending].sort((a, b) => b.amount - a.amount);
  const highestCategory = sortedCategories[0];

  const expenseRatio =
    summary.totalIncome > 0
      ? Math.round((summary.totalExpenses / summary.totalIncome) * 1000) / 10
      : 0;

  if (transactions.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Analytics &amp; Insights</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            In-depth breakdowns, category allocations, and spending efficiency metrics
          </p>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl mx-auto flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-indigo-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Analytics Available Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            No transactions yet. Add your first transaction above to get started! Once you record transactions, interactive charts and spending trends will appear here.
          </p>
          <button
            onClick={() => setAddTransactionOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Your First Transaction</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Analytics &amp; Insights</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          In-depth breakdowns, category allocations, and spending efficiency metrics
        </p>
      </div>

      {/* 1. Metric Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Inflow */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Inflows
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              Inflow
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalIncome)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Live recorded income</p>
          </div>
        </div>

        {/* Expenses Outflow */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Outflows
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600">
              <TrendingDown className="w-3.5 h-3.5" />
              Outflow
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-rose-600">
              {formatCurrency(summary.totalExpenses)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Total recorded expenses</p>
          </div>
        </div>

        {/* Savings Rate Trend */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Savings Rate
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-3.5 h-3.5" />
              {summary.savingsRate}%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-indigo-600">{summary.savingsRate}%</h3>
            <p className="text-xs text-slate-400 mt-1">Proportion of income saved</p>
          </div>
        </div>
      </div>

      {/* 2. Top Spending Insights Highlight Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Highest Category */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Top Spending Driver</p>
              <h4 className="text-lg font-extrabold text-amber-950 mt-0.5">
                {highestCategory ? `${highestCategory.category} (${formatCurrency(highestCategory.amount)})` : 'None'}
              </h4>
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-800 font-medium">
            {highestCategory
              ? `Represents ${highestCategory.percentage}% of your current expense budget.`
              : 'Add expenses to see your top category.'}
          </p>
        </div>

        {/* Monthly Savings */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Net Retained Wealth</p>
              <h4 className="text-lg font-extrabold text-indigo-950 mt-0.5">
                {formatCurrency(summary.savings)} Saved
              </h4>
            </div>
          </div>
          <p className="mt-3 text-xs text-indigo-800 font-medium">
            {summary.savings >= 0
              ? 'Positive capital accumulation across your active records.'
              : 'Current outflows exceed inflows.'}
          </p>
        </div>

        {/* Budget Health */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Budget Health</p>
              <h4 className="text-lg font-extrabold text-emerald-950 mt-0.5">
                {expenseRatio <= 40 ? 'Healthy' : expenseRatio <= 70 ? 'Moderate' : 'High Usage'} ({expenseRatio}% Used)
              </h4>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-800 font-medium">
            {expenseRatio <= 40
              ? 'Expense ratio is within safe conservative thresholds.'
              : 'Expense ratio exceeds conservative 40% threshold.'}
          </p>
        </div>
      </div>

      {/* 3. Visual Breakdown Row: Donut Chart, Grouped Monthly Bar Chart, Horizontal Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Donut with Center Total */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Expense Composition</h4>
            <p className="text-xs text-slate-400">Category share of total outlays</p>
          </div>

          {categorySpending.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No expense categories recorded yet.
            </div>
          ) : (
            <>
              <div className="relative h-64 w-full flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySpending}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-medium text-slate-400">Total Spent</span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(summary.totalExpenses)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {categorySpending.map((c) => (
                  <span
                    key={c.category}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-[11px] font-medium text-slate-700 border border-slate-100"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span>{c.category}</span>
                    <span className="font-bold">{c.percentage}%</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Grouped Monthly Overview Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Monthly Inflow vs Outflow Trend</h4>
            <p className="text-xs text-slate-400">Comparing income and expenses over time</p>
          </div>

          {monthlyData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No monthly data available yet.
            </div>
          ) : (
            <div className="h-64 w-full my-2">
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
                    tickFormatter={(val) => `₹${val >= 1000 ? `${val / 1000}k` : val}`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} barSize={18} />
                  <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Data Source</span>
            <span className="font-bold text-indigo-600">Encrypted Cloud Storage</span>
          </div>
        </div>

        {/* Category Spending Progress Bars */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Category Proportions</h4>
            <p className="text-xs text-slate-400">Horizontal distribution breakdown</p>
          </div>

          <div className="space-y-4 my-auto py-2">
            {categorySpending.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No category spending data yet.</p>
            ) : (
              categorySpending.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{cat.category}</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(cat.percentage, 100)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              {transactions.length} total transactions in scope
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
