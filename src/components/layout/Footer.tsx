import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200/80 text-center text-xs text-slate-400">
      <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto px-8 gap-2">
        <p>© 2026 Personal Expense Tracker. All rights reserved.</p>
        <p className="font-semibold text-slate-600 flex items-center justify-center gap-1">
          <span>Developed by Sanskriti with</span>
          <span className="text-rose-500 text-sm leading-none">❤️</span>
        </p>
      </div>
    </footer>
  );
};
