import React from 'react';
import { RotateCcw, Database } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const SettingsView: React.FC = () => {
  const { resetToDefaultData, transactions, splitGroups, splitExpenses } = useFinance();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Preferences & Data Controls</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure local workspace storage, default currency, and demo data state
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Storage & In-Memory Cache</h4>
            <p className="text-xs text-slate-400">
              Active records: {transactions.length} personal transactions, {splitGroups.length} split groups, {splitExpenses.length} group expenses
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h5 className="text-xs font-bold text-slate-900">Currency Symbol</h5>
              <p className="text-[11px] text-slate-500">Standard Indian Rupee (INR ₹)</p>
            </div>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800">
              ₹ INR
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h5 className="text-xs font-bold text-slate-900">Auto-Categorization AI Engine</h5>
              <p className="text-[11px] text-slate-500">Real-time keyword inference enabled</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-rose-50/50 rounded-xl border border-rose-100">
            <div>
              <h5 className="text-xs font-bold text-rose-900">Reset Demo Data</h5>
              <p className="text-[11px] text-rose-700/80">
                Restores the verified initial dataset (₹24,500 balance, ₹30,000 income, ₹5,500 expenses, ₹200 owed)
              </p>
            </div>
            <button
              onClick={resetToDefaultData}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
