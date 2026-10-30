import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200/80 text-center text-xs text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-8 gap-2">
        <p>© 2026 Personal Finance Intelligence. All rights reserved.</p>
        <p className="font-medium text-slate-500">
          Smart Expense Tracking, Automated Keyword Categorization & Group Split Ledger
        </p>
      </div>
    </footer>
  );
};
