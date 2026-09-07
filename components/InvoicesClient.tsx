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
  Calendar,
  Building,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentModal } from '@/components/PaymentModal';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  total: number;
  payments: Array<{ amount: number }>;
}

interface InvoicesClientProps {
  initialInvoices: Invoice[];
  initialTotal: number;
}

const PAGE_SIZE = 50;

export function InvoicesClient({ initialInvoices, initialTotal }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');

  const fetchInvoices = async (nextPage = 1) => {
    setLoading(true);
    try {
      let url = `/api/invoices?page=${nextPage}&limit=${PAGE_SIZE}&q=${encodeURIComponent(search)}`;
      if (selectedStatus !== 'ALL') {
        url += `&status=${selectedStatus}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.data);
        setTotal(data.pagination.total);
        setPage(data.pagination.page);
      }
    } catch (e) {
      console.error('Failed to fetch invoices:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      if (selectedStatus === 'ALL') {
        setInvoices(initialInvoices);
        setTotal(initialTotal);
        setPage(1);
      } else {
        fetchInvoices();
      }
      return;
    }
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, initialInvoices, initialTotal]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
        title="Invoices Overview"
        subtitle="Manage billing cycles, track payment statuses, and issue new invoices"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-indigo-400" />
            <span>Invoices ({total})</span>
            </h1>
            <p className="text-xs text-slate-400">View and manage customer billing records</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">All Statuses</option>
                <option value="DRAFT" className="bg-slate-900">Draft</option>
                <option value="SENT" className="bg-slate-900">Sent</option>
                <option value="PAID" className="bg-slate-900">Paid</option>
                <option value="OVERDUE" className="bg-slate-900">Overdue</option>
              </select>
            </div>

            <Link
              href="/dashboard/invoices/create"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Link>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing page {page} of {totalPages} ({total} invoices)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchInvoices(page - 1)}
                disabled={page === 1 || loading}
                className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              ><ChevronLeft className="w-4 h-4" /></button>
              <button
                onClick={() => fetchInvoices(page + 1)}
                disabled={page === totalPages || loading}
                className="p-2 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              ><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* Invoices List Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">Loading invoice records...</div>
          ) : invoices.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              {search || selectedStatus !== 'ALL'
                ? 'No invoices match your selected criteria.'
                : 'No invoices found. Click "Create Invoice" to start billing!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Issue / Due Date</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.map((inv) => {
                    const totalPaid = inv.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
                    const balanceDue = Math.max(0, inv.total - totalPaid);

                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-100">{inv.invoiceNumber}</td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-200">{inv.customer?.name}</p>
                              <p className="text-[10px] text-slate-400">{inv.customer?.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(inv.issueDate).toLocaleDateString()} &rarr;{' '}
                              <strong className="text-slate-200">{new Date(inv.dueDate).toLocaleDateString()}</strong>
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div>
                            <p className="font-extrabold text-slate-100 text-sm">${inv.total.toFixed(2)}</p>
                            {inv.status !== 'PAID' && balanceDue > 0 && (
                              <p className="text-[10px] text-amber-400 font-medium">Due: ${balanceDue.toFixed(2)}</p>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <StatusBadge status={inv.status} />
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'PAID' && (
                              <button
                                onClick={() => handleRecordPayment(inv.id)}
                                title="Record Payment"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              href={`/dashboard/invoices/${inv.id}`}
                              title="View Details / Export PDF"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                              title="Delete Invoice"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
