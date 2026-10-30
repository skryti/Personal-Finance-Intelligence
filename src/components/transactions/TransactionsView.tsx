import React, { useState, useEffect } from 'react';
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
  Lightbulb,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionCategory, TransactionType } from '../../types/finance';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { detectCategoryFromKeyword } from '../../utils/autoCategorize';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    loadingTransactions,
    transactionsError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    summary,
    categorySpending,
    isAddTransactionOpen,
    setAddTransactionOpen,
    editingTransaction,
    setEditingTransaction,
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  // Modal form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoDetected, setAutoDetected] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync form when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setAutoDetected(null);
      setManualOverride(true);
      setSubmitError(null);
    }
  }, [editingTransaction]);

  // Real-time keyword auto-detection on title change (only in add mode or before manual override)
  useEffect(() => {
    if (!manualOverride && title.trim().length > 1 && !editingTransaction) {
      const detection = detectCategoryFromKeyword(title);
      if (detection.category !== 'Other') {
        setCategory(detection.category);
        setAutoDetected(detection.matchedKeyword || null);
        if (detection.category === 'Income') {
          setType('income');
        } else {
          setType('expense');
        }
      } else {
        setAutoDetected(null);
      }
    }
  }, [title, manualOverride, editingTransaction]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setTitle('');
    setAmount('');
    setType('expense');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setAutoDetected(null);
    setManualOverride(false);
    setSubmitError(null);
    setAddTransactionOpen(true);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setAddTransactionOpen(true);
  };

  const handleCloseModal = () => {
    setAddTransactionOpen(false);
    setEditingTransaction(null);
    setSubmitError(null);
  };

  const handleCategorySelect = (newCat: string) => {
    setCategory(newCat);
    setManualOverride(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setSubmitError('Please enter a valid title and positive amount.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    if (editingTransaction) {
      const res = await updateTransaction(editingTransaction.id, {
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
      });

      setIsSubmitting(false);
      if (res.success) {
        handleCloseModal();
      } else {
        setSubmitError(res.error || 'Failed to update transaction');
      }
    } else {
      const res = await addTransaction({
        title: title.trim(),
        amount: parsedAmount,
        type,
        category,
        date,
      });

      setIsSubmitting(false);
      if (res.success) {
        handleCloseModal();
      } else {
        setSubmitError(res.error || 'Failed to save transaction');
      }
    }
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
            Real-time Supabase transactions with automatic keyword categorization
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                        <p className="font-semibold text-slate-600">Loading transactions from Supabase...</p>
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

      {/* Add / Edit Transaction Modal */}
      {isAddTransactionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={handleCloseModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {editingTransaction
                ? 'Update your transaction details in Supabase'
                : 'Type description keywords (e.g. Swiggy, Uber, Flipkart) for smart auto-categorization'}
            </p>

            {submitError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Title / Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Title / Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy dinner or Monthly Salary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                />
                {autoDetected && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-indigo-600 font-medium">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>
                      Detected keyword <strong>"{autoDetected}"</strong> &rarr; Auto-assigned to{' '}
                      <strong>{category}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Amount & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    placeholder="e.g. 450"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`flex-1 py-1.5 text-center font-semibold rounded-lg transition-all cursor-pointer ${
                        type === 'expense'
                          ? 'bg-white text-rose-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`flex-1 py-1.5 text-center font-semibold rounded-lg transition-all cursor-pointer ${
                        type === 'income'
                          ? 'bg-white text-emerald-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
              </div>

              {/* Category picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Category (Auto-detected or Manual Override)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`px-2 py-2 rounded-xl border text-center transition-all cursor-pointer ${
                        category === cat
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingTransaction ? 'Save Changes' : 'Save Transaction'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
