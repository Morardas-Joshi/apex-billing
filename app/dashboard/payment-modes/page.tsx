import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Wallet, Plus } from 'lucide-react';

export default function PaymentModesPage() {
  const modes = [
    { name: 'UPI (GPay / PhonePe / Paytm)', type: 'Digital UPI', status: 'ACTIVE' },
    { name: 'NEFT / RTGS / IMPS Direct Transfer', type: 'Bank Wire', status: 'ACTIVE' },
    { name: 'Net Banking & Credit Card', type: 'Gateway', status: 'ACTIVE' },
    { name: 'Cash Payment', type: 'Offline Cash', status: 'ACTIVE' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="Payment Modes" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Payment Modes & Channels</h1>
            <p className="text-xs text-slate-500 mt-1">Manage accepted payment channels for invoice receipts</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Payment Mode Name</th>
                <th className="py-3.5 px-6">Channel Type</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modes.map((m) => (
                <tr key={m.name} className="hover:bg-slate-50">
                  <td className="py-4 px-6 font-bold text-slate-900">{m.name}</td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{m.type}</td>
                  <td className="py-4 px-6">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
