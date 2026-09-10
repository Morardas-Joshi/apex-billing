import React from 'react';
import { Navbar } from '@/components/Navbar';
import { FileSpreadsheet, Download } from 'lucide-react';

export default function GSTR3BPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="GSTR-3B Monthly Summary Return" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">GSTR-3B Summary Return</h1>
            <p className="text-xs text-slate-500 mt-1">Summary tax liability and Input Tax Credit (ITC) reconciliation for government filing</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2">
            <Download size={16} /> Download GSTR-3B Computation
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 mb-4">3.1 Details of Outward Supplies and inward supplies liable to reverse charge</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <th className="py-3 px-4">Nature of Supplies</th>
                  <th className="py-3 px-4 text-right">Total Taxable Value</th>
                  <th className="py-3 px-4 text-right">Integrated Tax (IGST)</th>
                  <th className="py-3 px-4 text-right">Central Tax (CGST)</th>
                  <th className="py-3 px-4 text-right">State Tax (SGST)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-3 px-4 font-semibold text-slate-800">(a) Outward taxable supplies (other than zero rated, nil rated and exempted)</td>
                  <td className="py-3 px-4 text-right font-mono font-bold">₹3,70,000.00</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">₹33,300.00</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">₹16,650.00</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-indigo-600">₹16,650.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
