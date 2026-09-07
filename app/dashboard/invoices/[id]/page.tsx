'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Download,
  CreditCard,
  Building,
  Calendar,
  CheckCircle2,
  Send,
  Trash2,
  Clock,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentModal } from '@/components/PaymentModal';
import { downloadInvoicePDF } from '@/lib/pdf';

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  notes?: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    method: string;
    paidAt: string;
    notes?: string | null;
  }>;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchInvoice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (res.ok) {
        setInvoice(data);
      } else {
        alert(data.error || 'Invoice not found');
      }
    } catch (e) {
      console.error('Failed to fetch invoice detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return;
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchInvoice();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) return;

    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/dashboard/invoices');
      }
    } catch (e) {
      console.error('Failed to delete invoice:', e);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setDownloading(true);
    try {
      await downloadInvoicePDF('invoice-printable-card', invoice.invoiceNumber);
    } catch (e: any) {
      alert('Error generating PDF: ' + e.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="Invoice Details" />
        <div className="p-16 text-center text-slate-500 text-xs flex-1">Loading invoice details...</div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <Navbar title="Invoice Not Found" />
        <div className="p-16 text-center text-rose-400 text-xs flex-1">Invoice could not be loaded.</div>
      </>
    );
  }

  const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, invoice.total - totalPaid);

  return (
    <>
      <Navbar title={`Invoice ${invoice.invoiceNumber}`} subtitle="Official customer invoice statement and settlement details" />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/dashboard/invoices"
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Quick Action Toggles */}
            {invoice.status === 'DRAFT' && (
              <button
                onClick={() => handleStatusChange('SENT')}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Mark as Sent</span>
              </button>
            )}

            {invoice.status !== 'PAID' && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment</span>
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleDelete}
              title="Delete Invoice"
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CARD CONTAINER */}
        <div id="invoice-printable-card" className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-8 bg-slate-900/90 text-slate-100 shadow-2xl">
          {/* Header Branding & Invoice # */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Apex Billing</span>
              </div>
              <p className="text-xs text-slate-400">100 Technology Plaza, San Francisco, CA 94107</p>
              <p className="text-xs text-slate-400">support@apexbilling.io | +1 (800) 555-0199</p>
            </div>

            <div className="sm:text-right">
              <div className="inline-block mb-2">
                <StatusBadge status={invoice.status} size="lg" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{invoice.invoiceNumber}</h1>
              <p className="text-xs text-slate-400 mt-1">
                Issued: {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
              <p className="text-xs font-semibold text-indigo-400">
                Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Billed To Client Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Billed To (Client)</p>
              <h3 className="text-base font-extrabold text-slate-100">{invoice.customer.name}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{invoice.customer.email}</p>
              {invoice.customer.phone && <p className="text-xs text-slate-400">{invoice.customer.phone}</p>}
              {invoice.customer.address && <p className="text-xs text-slate-400 mt-2 max-w-xs">{invoice.customer.address}</p>}
            </div>

            <div className="md:text-right flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Invoice Total</p>
                <p className="text-3xl font-extrabold text-indigo-400">${invoice.total.toFixed(2)}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between md:justify-end gap-4 text-slate-300">
                  <span>Paid to date:</span>
                  <strong className="text-emerald-400">${totalPaid.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between md:justify-end gap-4 text-slate-200 font-bold mt-1">
                  <span>Balance Due:</span>
                  <strong className={balanceDue > 0 ? 'text-amber-400' : 'text-slate-400'}>
                    ${balanceDue.toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-200 mb-3 uppercase tracking-wider">Services & Deliverables</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Item Description</th>
                    <th className="py-3.5 px-4 text-center">Qty</th>
                    <th className="py-3.5 px-4 text-right">Unit Price</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{item.description}</td>
                      <td className="py-3.5 px-4 text-center text-slate-300">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right text-slate-300">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-100">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculation Summary Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div>
              {invoice.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Notes & Terms</h4>
                  <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-200">${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax ({invoice.taxRate}%):</span>
                <span className="font-semibold text-slate-200">${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-extrabold text-sm text-white">
                <span>Total Amount:</span>
                <span className="text-indigo-400">${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment History Log */}
          {invoice.payments.length > 0 && (
            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Payment Receipts</h4>
              <div className="space-y-2">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{p.method} Payment</span>
                      <span className="text-slate-400 font-normal">on {new Date(p.paidAt).toLocaleDateString()}</span>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm">+${p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={fetchInvoice}
        defaultInvoiceId={invoice.id}
        invoices={[{
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
          customer: { name: invoice.customer.name },
        }]}
      />
    </>
  );
}
