import React from 'react';
import { Navbar } from '@/components/Navbar';
import { FileMinus, Plus } from 'lucide-react';

export default function CreditNotesPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="Credit Notes" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Credit Notes</h1>
            <p className="text-xs text-slate-500 mt-1">Issue GST credit notes for sales returns, adjustments, or tax amendments</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2">
            <Plus size={16} /> Issue Credit Note
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <FileMinus size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Credit Notes Issued Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When you issue sales return adjustments, credit notes will appear here with full GST breakdown.
          </p>
        </div>
      </div>
    </div>
  );
}
