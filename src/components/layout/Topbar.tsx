import React from 'react';
import { Calendar, Plus, LogOut, LogIn } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const { setAddTransactionOpen } = useFinance();
  const { user, session, handleGoogleLogin, handleLogout, isDemoMode, exitDemoMode } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Sanskriti';

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initial = (displayName[0] || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between">
      {/* Dynamic Greeting */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {displayName} 👋
            </h2>
            {session ? (
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Online
              </span>
            ) : isDemoMode ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                🚀 Demo Mode
              </span>
            ) : null}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Here&apos;s your financial overview today.
          </p>
        </div>
      </div>

      {/* Date badge, Quick Add, and Avatar */}
      <div className="flex items-center gap-3">
        {/* Date badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{getFormattedDate()}</span>
        </div>

        {/* Quick Add Action - Works from any page */}
        <button
          onClick={() => setAddTransactionOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-indigo-200 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>

        {/* Auth / Avatar Section */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          {session ? (
            <div className="flex items-center gap-2">
              <div className="relative group cursor-pointer" title={user?.email || displayName}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500 shadow-xs"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-xs">
                    {initial}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          ) : isDemoMode ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-200 shadow-xs" title="Demo User">
                S
              </div>
              <button
                onClick={exitDemoMode}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:text-rose-600 bg-amber-50 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-amber-200 hover:border-rose-200"
                title="Exit Demo Mode"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Exit Demo</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Sign in with Google"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
