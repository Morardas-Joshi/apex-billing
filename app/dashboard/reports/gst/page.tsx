import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Receipt, Download } from 'lucide-react';

export default function GSTReportPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="GST Tax Summary Report" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">GST Tax Summary & Audit Ledger</h1>
            <p className="text-xs text-slate-500 mt-1">Detailed breakdown of CGST, SGST, IGST collected across all invoices</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2">
            <Download size={16} /> Export Tax Audit PDF
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">GST Rate Slab</th>
                <th className="py-3.5 px-6 text-right">Taxable Turnover</th>
                <th className="py-3.5 px-6 text-right">CGST (9%)</th>
                <th className="py-3.5 px-6 text-right">SGST (9%)</th>
                <th className="py-3.5 px-6 text-right">IGST (18%)</th>
                <th className="py-3.5 px-6 text-right">Total Tax Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-4 px-6 font-bold text-slate-900">GST 18% Standard</td>
                <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">₹3,70,000.00</td>
                <td className="py-4 px-6 text-right font-mono font-bold text-indigo-600">₹16,650.00</td>
                <td className="py-4 px-6 text-right font-mono font-bold text-indigo-600">₹16,650.00</td>
                <td className="py-4 px-6 text-right font-mono font-bold text-blue-600">₹33,300.00</td>
                <td className="py-4 px-6 text-right font-mono font-extrabold text-emerald-600">₹66,600.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
