import React from 'react';
import { Navbar } from '@/components/Navbar';
import { FileSpreadsheet, Download } from 'lucide-react';

export default function GSTR1Page() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="GSTR-1 Outward Supplies Return" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">GSTR-1 Outward Supplies Return</h1>
            <p className="text-xs text-slate-500 mt-1">Export B2B, B2C, HSN summary, and Tax details for GST portal upload</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2">
            <Download size={16} /> Export GSTR-1 JSON / Excel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total B2B Invoices</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">2 Invoices</h3>
            <p className="text-xs text-emerald-600 font-bold mt-1">Taxable: ₹3,70,000</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total CGST + SGST</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-2">₹33,300</h3>
            <p className="text-xs text-slate-500 mt-1">Central & State Split</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total IGST</p>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-2">₹33,300</h3>
            <p className="text-xs text-slate-500 mt-1">Inter-State Supply</p>
          </div>
        </div>
      </div>
    </div>
  );
}
