import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ShoppingCart, Plus, Search, FileText } from 'lucide-react';
import Link from 'next/link';

export default function SalesOrdersPage() {
  const sampleOrders = [
    { id: 'SO0202600001', customer: 'Tata Consultancy Services Ltd', date: '10 Sep 2026', total: '₹2,95,000', status: 'CONFIRMED' },
    { id: 'SO0202600002', customer: 'Infosys Limited', date: '08 Sep 2026', total: '₹1,41,600', status: 'INVOICED' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <Navbar title="Sales Orders" />
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Sales Orders</h1>
            <p className="text-xs text-slate-500 mt-1">Manage customer quotations, confirmed sales orders, and conversions to tax invoices</p>
          </div>
          <Link
            href="/dashboard/invoices/create"
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md inline-flex items-center gap-2"
          >
            <Plus size={16} /> Create Sales Order
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Order #</th>
                <th className="py-3.5 px-6">Customer</th>
                <th className="py-3.5 px-6">Order Date</th>
                <th className="py-3.5 px-6 text-right">Amount (INR)</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sampleOrders.map((so) => (
                <tr key={so.id} className="hover:bg-slate-50">
                  <td className="py-4 px-6 font-mono font-bold text-blue-600">{so.id}</td>
                  <td className="py-4 px-6 font-semibold text-slate-800">{so.customer}</td>
                  <td className="py-4 px-6 text-slate-500">{so.date}</td>
                  <td className="py-4 px-6 text-right font-extrabold text-slate-900">{so.total}</td>
                  <td className="py-4 px-6">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                      {so.status}
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
