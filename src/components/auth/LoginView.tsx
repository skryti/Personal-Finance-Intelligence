import React from 'react';
import { TrendingUp, Sparkles, AlertCircle, X, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { handleGoogleLogin, loginError, clearLoginError, enterDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* App Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center text-white mb-4">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Personal Expense Tracker
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Smart expense tracking, AI categorization &amp; split bills
          </p>
        </div>

        {/* Login Action Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Secure Authentication</span>
            </div>
            
            <h2 className="text-lg font-bold text-slate-900 tracking-tight pt-1">
              Click Sign in with Google.
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              It will redirect to Google&apos;s consent screen, allow you to choose your account, and redirect you back to your personal tracker.
            </p>
          </div>

          {/* Error Message if OAuth fails or is canceled */}
          {loginError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-3 text-rose-800 text-xs relative animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-900">Sign-in Notice</p>
                  <p className="text-rose-700">{loginError}</p>
                </div>
              </div>
              <button
                onClick={clearLoginError}
                className="text-rose-400 hover:text-rose-700 p-0.5 rounded-lg transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Sign in with Google Button & Demo Option */}
          <div className="space-y-3.5">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-semibold rounded-2xl border border-slate-300 shadow-xs hover:shadow transition-all group cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-sm">Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Simple Explore Demo Button */}
            <button
              onClick={enterDemoMode}
              className="w-full flex items-center justify-center px-5 py-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-semibold rounded-2xl border border-slate-200 transition-colors cursor-pointer text-sm"
            >
              Explore Demo
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
          <span>Developed by Sanskriti with</span>
          <span className="text-rose-500 text-sm leading-none">❤️</span>
        </p>
      </div>
    </div>
  );
};
