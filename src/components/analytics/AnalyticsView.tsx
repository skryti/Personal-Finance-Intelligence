import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ShieldCheck,
  Wallet,
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
  const { summary, categorySpending, monthlyData } = useFinance();

  // Find highest expense category
  const sortedCategories = [...categorySpending].sort((a, b) => b.amount - a.amount);
  const highestCategory = sortedCategories[0] || { category: 'Food', amount: 2100, percentage: 38.2 };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Financial Analytics & Insights</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          In-depth breakdowns, month-over-month growth indicators, and spending efficiency metrics
        </p>
      </div>

      {/* 1. Metric Overview Cards with MoM Trend Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income MoM */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monthly Inflow
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              +7.1%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-slate-900">
              {formatCurrency(summary.totalIncome)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Compared to ₹28,000 in August</p>
          </div>
        </div>

        {/* Expenses MoM */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Monthly Outflow
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
              <TrendingDown className="w-3.5 h-3.5" />
              -5.2%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-rose-600">
              {formatCurrency(summary.totalExpenses)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Compared to ₹5,800 in August</p>
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
              +2.4%
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-indigo-600">{summary.savingsRate}%</h3>
            <p className="text-xs text-slate-400 mt-1">Up from 79.3% in previous cycle</p>
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
                {highestCategory.category} ({formatCurrency(highestCategory.amount)})
              </h4>
            </div>
          </div>
          <p className="mt-3 text-xs text-amber-800 font-medium">
            Represents {highestCategory.percentage}% of your current monthly expense budget.
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
            Outstanding capital accumulation exceeding the recommended 50/30/20 benchmark.
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
                Excellent (18.3% Used)
              </h4>
            </div>
          </div>
          <p className="mt-3 text-xs text-emerald-800 font-medium">
            Your expense ratio is well under the safe ceiling of 40% monthly income.
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
        </div>

        {/* Grouped Monthly Overview Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">3-Month Inflow vs Outflow Trend</h4>
            <p className="text-xs text-slate-400">Quarterly progression analysis</p>
          </div>

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
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} barSize={18} />
                <Bar dataKey="expenses" name="Expenses" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Quarterly Net Surplus</span>
            <span className="font-bold text-emerald-600">+₹68,500</span>
          </div>
        </div>

        {/* Horizontal Progress Bars for Category Spending */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Category Proportions</h4>
            <p className="text-xs text-slate-400 mb-5">Horizontal percentage utilization</p>

            <div className="space-y-4">
              {categorySpending.map((cat) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{cat.category}</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(cat.amount)}{' '}
                      <span className="text-slate-400 font-normal">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(cat.percentage, 100)}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total Categories Active</span>
            <span className="font-bold text-slate-900">{categorySpending.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
