import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Users,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TabType } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, summary } = useFinance();

  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'split-bills', label: 'Split Bills', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between z-30 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm leading-tight tracking-tight">
                Personal Expense Tracker
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Smart Budgeting</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-4 space-y-1.5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-4 bg-indigo-600 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Mini Balance Card */}
      <div className="p-4 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-sm">
          <div className="text-xs text-slate-300 font-medium mb-1">
            <span>Net Balance</span>
          </div>
          <div className="text-lg font-bold tracking-tight">
            {formatCurrency(summary.totalBalance)}
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex justify-between items-center">
            <span>Savings Rate</span>
            <span className="text-white font-semibold">{summary.savingsRate}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
