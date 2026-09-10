'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Calendar,
  Building,
  FileText,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { PaymentModal } from '@/components/PaymentModal';
import { formatINR } from '@/lib/formatters';

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
    Promise.all([fetchPayments(), fetchUnpaidInvoices()]);
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
        title="Payment Receipts Log (INR ₹)"
        subtitle="Track Indian payment history, UPI / NEFT transaction receipts, and UTR numbers"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              <span>Payments Log ({filteredPayments.length})</span>
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">Total Collected Revenue: <strong className="text-emerald-700 font-extrabold">{formatINR(totalCollected)}</strong></p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment (INR ₹)</span>
          </button>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-600 font-medium text-xs">Loading payment receipts...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center text-slate-600 font-medium text-xs">
              {search ? 'No payments matching your search.' : 'No payment records found yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="text-[11px] uppercase tracking-wider text-slate-700 bg-slate-100 border-b border-slate-200 font-extrabold">
                  <tr>
                    <th className="py-3.5 px-6">Payment Date</th>
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Customer Name</th>
                    <th className="py-3.5 px-6">Mode</th>
                    <th className="py-3.5 px-6">UTR / Memo</th>
                    <th className="py-3.5 px-6 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(p.paidAt).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-bold text-blue-600 font-mono">
                        <Link
                          href={`/dashboard/invoices/${p.invoice?.id}`}
                          className="hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>{p.invoice?.invoiceNumber}</span>
                        </Link>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.invoice?.customer?.name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                          {p.method}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600 max-w-xs truncate font-mono text-[11px] font-medium">
                        {p.notes || <span className="text-slate-400">—</span>}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className="font-extrabold text-emerald-700 text-sm">+{formatINR(p.amount)}</span>
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
