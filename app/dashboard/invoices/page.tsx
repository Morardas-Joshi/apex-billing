'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Filter,
  Eye,
  Trash2,
  CreditCard,
  Building,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentModal } from '@/components/PaymentModal';
import { formatINR } from '@/lib/formatters';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    gstin?: string;
  };
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  isInterState: boolean;
  total: number;
  payments: Array<{ amount: number }>;
}

export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      let url = `/api/invoices?q=${encodeURIComponent(search)}`;
      if (selectedStatus !== 'ALL') {
        url += `&status=${selectedStatus}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setInvoices(data);
      }
    } catch (e) {
      console.error('Failed to fetch invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      fetchInvoices();
      return;
    }
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedStatus]);

  const handleDelete = async (id: string, num: string) => {
    if (!confirm(`Are you sure you want to delete invoice "${num}"?`)) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchInvoices();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete invoice');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting invoice');
    }
  };

  const handleRecordPayment = (id: string) => {
    setSelectedInvoiceId(id);
    setIsPaymentModalOpen(true);
  };

  return (
    <>
      <Navbar
        title="GST Tax Invoices Overview"
        subtitle="Issue GST Compliant Tax Invoices, track CGST/SGST/IGST breakdown, and record UPI/NEFT settlements"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Tax Invoices ({invoices.length})</span>
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">View and manage Indian GST business billing records</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-700 font-bold">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-slate-900 font-extrabold focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>

            <Link
              href="/dashboard/invoices/create"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Tax Invoice</span>
            </Link>
          </div>
        </div>

        {/* Invoices List Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-600 font-medium text-xs">Loading GST invoice records...</div>
          ) : invoices.length === 0 ? (
            <div className="py-16 text-center text-slate-600 font-medium text-xs">
              {search || selectedStatus !== 'ALL'
                ? 'No invoices match your selected criteria.'
                : 'No invoices found. Click "Create Tax Invoice" to start billing!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="text-[11px] uppercase tracking-wider text-slate-700 bg-slate-100 border-b border-slate-200 font-extrabold">
                  <tr>
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Customer & GSTIN</th>
                    <th className="py-3.5 px-6">GST Type</th>
                    <th className="py-3.5 px-6">Total Amount (₹)</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invoices.map((inv) => {
                    const totalPaid = inv.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                    const balanceDue = Math.max(0, inv.total - totalPaid);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-mono font-extrabold text-blue-600">{inv.invoiceNumber}</td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <div>
                              <p className="font-bold text-slate-900">{inv.customer?.name}</p>
                              {inv.customer?.gstin && (
                                <p className="text-[10px] text-blue-700 font-mono font-bold">GSTIN: {inv.customer.gstin}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          {inv.isInterState ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded bg-purple-50 border border-purple-200 text-purple-800 font-bold text-[11px]">
                              IGST (Inter-State)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[11px]">
                              CGST + SGST (Intra-State)
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm">{formatINR(inv.total)}</p>
                            {inv.status !== 'PAID' && balanceDue > 0 && (
                              <p className="text-[10px] text-amber-800 font-bold">Due: {formatINR(balanceDue)}</p>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <StatusBadge status={inv.status} />
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {inv.status !== 'PAID' && (
                              <button
                                onClick={() => handleRecordPayment(inv.id)}
                                title="Record Payment"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              href={`/dashboard/invoices/${inv.id}`}
                              title="View Tax Invoice / Print PDF"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                              title="Delete Invoice"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={fetchInvoices}
        defaultInvoiceId={selectedInvoiceId}
        invoices={invoices.map((i) => ({
          id: i.id,
          invoiceNumber: i.invoiceNumber,
          total: i.total,
          customer: { name: i.customer.name },
        }))}
      />
    </>
  );
}
