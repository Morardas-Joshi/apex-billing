import React from 'react';
import { Navbar } from '@/components/Navbar';
import { TrendingUp, Download } from 'lucide-react';

export default function SalesReportPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="Sales Summary Report" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Sales & Revenue Analytics</h1>
            <p className="text-xs text-slate-500 mt-1">Breakdown of customer billing, paid vs pending invoice balances</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2">
            <Download size={16} /> Download Excel Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total Billed Revenue</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">₹4,36,600</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Received Collections</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">₹2,95,000</h3>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Outstanding Receivable</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-2">₹1,41,600</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
