'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Calendar,
  Building,
  FileText,
  DollarSign,
  Search,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PaymentModal } from '@/components/PaymentModal';

interface Payment {
  id: string;
  amount: number;
  method: string;
  paidAt: string;
  notes?: string | null;
  invoice: {
    id: string;
    invoiceNumber: string;
    customer: {
      name: string;
      email: string;
    };
  };
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoicesForPayment, setInvoicesForPayment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments');
      const data = await res.json();
      if (res.ok) {
        setPayments(data);
      }
    } catch (e) {
      console.error('Failed to fetch payments:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidInvoices = async () => {
    try {
      const res = await fetch('/api/invoices?status=SENT');
      const data = await res.json();
      if (res.ok) {
        setInvoicesForPayment(data);
      }
    } catch (e) {
      console.error('Failed to fetch invoices for payment:', e);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchUnpaidInvoices();
  }, []);

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter(
    (p) =>
      p.invoice?.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.invoice?.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar
        title="Payment Receipts Log"
        subtitle="Track payment history, payment methods, and transaction receipts"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              <span>Payments Log ({filteredPayments.length})</span>
            </h1>
            <p className="text-xs text-slate-400">Total Revenue Collected: <strong className="text-emerald-400">${totalCollected.toFixed(2)}</strong></p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>

        {/* Payments Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">Loading payments log...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              {search ? 'No payments matching your search.' : 'No payment records found yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Payment Date</th>
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Customer Name</th>
                    <th className="py-3.5 px-6">Method</th>
                    <th className="py-3.5 px-6">Notes / Memo</th>
                    <th className="py-3.5 px-6 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-medium text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(p.paidAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-100">
                        <Link
                          href={`/dashboard/invoices/${p.invoice?.id}`}
                          className="hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{p.invoice?.invoiceNumber}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-6 font-semibold text-slate-200">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.invoice?.customer?.name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium text-[11px]">
                          {p.method}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-400 max-w-xs truncate">
                        {p.notes || <span className="text-slate-600 font-mono">—</span>}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className="font-extrabold text-emerald-400 text-sm">+${p.amount.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchPayments();
          fetchUnpaidInvoices();
        }}
        invoices={invoicesForPayment}
      />
    </>
  );
}
