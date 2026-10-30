import React, { useState, useEffect } from 'react';
import { X, Lightbulb, AlertCircle, Loader2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionCategory, TransactionType } from '../../types/finance';
import { detectCategoryFromKeyword } from '../../utils/autoCategorize';

const CATEGORIES: TransactionCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Income',
  'Other',
];

export const AddTransactionModal: React.FC = () => {
  const {
    isAddTransactionOpen,
    setAddTransactionOpen,
    editingTransaction,
    setEditingTransaction,
    addTransaction,
    updateTransaction,
  } = useFinance();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoDetected, setAutoDetected] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Sync form when modal opens or editingTransaction changes
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
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setAutoDetected(null);
      setManualOverride(false);
      setSubmitError(null);
    }
  }, [editingTransaction, isAddTransactionOpen]);

  // Keyword auto-detection on title change
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

  if (!isAddTransactionOpen) return null;

  const handleClose = () => {
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
        handleClose();
      } else {
        setSubmitError(res.error || 'Failed to update transaction.');
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
        handleClose();
      } else {
        setSubmitError(res.error || 'Failed to save transaction.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {editingTransaction
            ? 'Update your transaction details'
            : 'Type description keywords (e.g. Swiggy, Uber, Rent, Salary) for smart auto-categorization'}
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
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
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
              onClick={handleClose}
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
  );
};
