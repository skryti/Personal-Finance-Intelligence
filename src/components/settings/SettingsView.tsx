import React from 'react';
import { RotateCcw, Database, UserCheck, LogOut, Shield } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

export const SettingsView: React.FC = () => {
  const { resetToDefaultData, transactions, splitGroups, splitExpenses } = useFinance();
  const { user, session, handleLogout } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    'Authenticated User';

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Preferences &amp; Data Controls</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure authentication, database synchronizations, currency, and split ledger state
        </p>
      </div>

      {/* Account & Authentication Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Account &amp; Google Authentication</h4>
            <p className="text-xs text-slate-400">
              Secured via Google OAuth 2.0 &amp; Encrypted Cloud Sync
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                {displayName[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-bold text-slate-900">{displayName}</h5>
                {session && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    <UserCheck className="w-3 h-3" /> Signed In
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{user?.email || 'Authenticated via Google'}</p>
            </div>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Database &amp; Storage Records</h4>
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

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <h5 className="text-xs font-bold text-slate-900">Reset Split Bills Ledger</h5>
              <p className="text-[11px] text-slate-500">
                Resets local split groups and settlement entries to default state
              </p>
            </div>
            <button
              onClick={resetToDefaultData}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Split Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
