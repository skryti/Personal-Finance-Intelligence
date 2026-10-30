import React from 'react';
import { Calendar, Plus, Bell, LogOut, LogIn } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';

export const Topbar: React.FC = () => {
  const { setAddTransactionOpen } = useFinance();
  const { user, session, handleGoogleLogin, handleLogout } = useAuth();

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
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {displayName} 👋
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {session ? 'Signed in with Google' : "Here's what is happening with your expenses today."}
          </p>
        </div>
      </div>

      {/* Date badge, Quick Add, Notifications, and Avatar */}
      <div className="flex items-center gap-3">
        {/* Date badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{getFormattedDate()}</span>
        </div>

        {/* Quick Add Action */}
        <button
          onClick={() => setAddTransactionOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-indigo-200 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Transaction</span>
        </button>

        {/* Notification Bell */}
        <button
          className="w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-colors relative cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
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
                title="Sign out of Google"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
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
