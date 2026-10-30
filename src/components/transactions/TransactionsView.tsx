import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  X,
  Utensils,
  ShoppingBag,
  Plane,
  Receipt,
  Film,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionCategory } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    loadingTransactions,
    transactionsError,
    deleteTransaction,
    summary,
    categorySpending,
    setAddTransactionOpen,
    setEditingTransaction,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setAddTransactionOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setAddTransactionOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setDeletingId(id);
      await deleteTransaction(id);
      setDeletingId(null);
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    const matchesType = selectedType === 'All' || tx.type === selectedType.toLowerCase();
    return matchesSearch && matchesCategory && matchesType;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
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
      case 'Income':
        return <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const categories: TransactionCategory[] = [
    'Food',
    'Travel',
    'Shopping',
    'Bills',
    'Entertainment',
    'Income',
    'Other',
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Action Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Transactions Ledger</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time transactions with automatic keyword categorization
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>
      </div>

      {transactionsError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Error loading transactions: {transactionsError}</span>
        </div>
      )}

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Filter Toolbar & Transactions Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search description or amount..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Category:</span>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-indigo-500 font-medium w-full sm:w-auto cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Expense">Expense Only</option>
              <option value="Income">Income Only</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-right">Type</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {loadingTransactions ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                        <p className="font-semibold text-slate-600">Loading your finances...</p>
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-14 text-center">
                        <div className="max-w-sm mx-auto space-y-3">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-indigo-500" />
                          </div>
                          <h4 className="font-bold text-slate-800 text-sm">No transactions yet</h4>
                          <p className="text-xs text-slate-500">
                            No transactions yet. Add your first transaction above to get started!
                          </p>
                          <button
                            onClick={handleOpenAddModal}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add Your First Transaction</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">No matching transactions</p>
                        <p className="text-xs text-slate-400 mt-0.5">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <span className="p-1.5 rounded-lg bg-slate-100 shrink-0">
                              {getCategoryIcon(tx.category)}
                            </span>
                            <span className="truncate max-w-[200px] sm:max-w-[260px]">{tx.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                            {tx.category}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                            tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
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
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditModal(tx)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={deletingId === tx.id}
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete transaction"
                            >
                              {deletingId === tx.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
              <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
              <span className="font-medium">Total: {formatCurrency(summary.totalBalance)} Net</span>
            </div>
          </div>
        </div>

        {/* Side Column: Quick Financial Summary & Category Breakdown */}
        <div className="space-y-6">
          {/* Quick Financial Summary */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Quick Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium">Total Inflows</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">
                  {formatCurrency(summary.totalIncome)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-600 font-medium">Total Outflows</span>
                </div>
                <span className="text-xs font-bold text-rose-600">
                  {formatCurrency(summary.totalExpenses)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-100/60">
                <span className="text-xs font-bold text-indigo-900">Net Balance</span>
                <span className="text-sm font-extrabold text-indigo-600">
                  {formatCurrency(summary.totalBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Categories Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Category Spending</h3>
            <div className="space-y-3">
              {categorySpending.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No expense category data recorded yet.
                </p>
              ) : (
                categorySpending.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{cat.category}</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
          </div>
        </div>
      </div>
    </div>
  );
};
