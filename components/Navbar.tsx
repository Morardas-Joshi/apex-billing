'use client';

import React from 'react';
import { Search, Bell, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  title?: string;
  subtitle?: string;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  title = 'Dashboard',
  subtitle = 'Overview of business billing and revenue metrics',
  onSearchChange,
  searchValue = '',
}) => {
  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-20 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search input if supported */}
        {onSearchChange && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices, customers..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
            />
          </div>
        )}

        {/* Serverless Live Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Neon Serverless Active</span>
        </div>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
      </div>
    </header>
  );
};
