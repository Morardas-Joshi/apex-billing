'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  CreditCard,
  Building,
  CheckCircle2,
  Send,
  Trash2,
  Zap,
  FileCheck,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentModal } from '@/components/PaymentModal';
import { downloadInvoicePDF } from '@/lib/pdf';
import { formatINR } from '@/lib/formatters';

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  cgst: number;
  sgst: number;
  igst: number;
  isInterState: boolean;
  placeOfSupply?: string | null;
  total: number;
  notes?: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    gstin?: string | null;
    state?: string | null;
    stateCode?: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    hsnSac?: string | null;
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
        <Navbar title="Tax Invoice Details" />
        <div className="p-16 text-center text-slate-600 font-medium text-xs flex-1">Loading GST tax invoice details...</div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <Navbar title="Invoice Not Found" />
        <div className="p-16 text-center text-rose-600 font-bold text-xs flex-1">Tax Invoice could not be loaded.</div>
      </>
    );
  }

  const totalPaid = invoice.payments.reduce((acc, p) => acc + p.amount, 0);
  const balanceDue = Math.max(0, invoice.total - totalPaid);

  return (
    <>
      <Navbar title={`Tax Invoice ${invoice.invoiceNumber}`} subtitle="Official Indian GST Tax Invoice Statement" />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl bg-slate-50">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/dashboard/invoices"
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {invoice.status === 'DRAFT' && (
              <button
                onClick={() => handleStatusChange('SENT')}
                className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-100 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5 text-amber-700" />
                <span>Mark as Issued</span>
              </button>
            )}

            {invoice.status !== 'PAID' && (
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payment (INR ₹)</span>
              </button>
            )}

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Generating PDF...' : 'Download GST PDF'}</span>
            </button>

            <button
              onClick={handleDelete}
              title="Delete Invoice"
              className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE OFFICIAL GST TAX INVOICE */}
        <div id="invoice-printable-card" className="bg-white rounded-3xl p-8 border border-slate-200 space-y-8 text-slate-900 shadow-xl">
          {/* Header Branding & Invoice # */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 block">Jash Apparels ERP</span>
                  <span className="text-[10px] text-blue-700 uppercase tracking-widest font-extrabold">TAX INVOICE (ORIGINAL FOR RECIPIENT)</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-medium">101, Textile Market, Ring Road, Ahmedabad, GJ 380001</p>
              <p className="text-xs text-slate-500 font-medium">Email: billing@jashapparels.com | Phone: +91 98765 43210</p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold">
                <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>GSTIN: 24ABCDE1234F1Z5</span>
                <span className="text-slate-600 font-semibold">| State: 24-Gujarat</span>
              </div>
            </div>

            <div className="sm:text-right">
              <div className="inline-block mb-2">
                <StatusBadge status={invoice.status} size="lg" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">{invoice.invoiceNumber}</h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Invoice Date: <strong className="text-slate-900 font-bold">{new Date(invoice.issueDate).toLocaleDateString()}</strong>
              </p>
              <p className="text-xs font-bold text-blue-700 mt-0.5">
                Payment Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-600 mt-1 font-mono">
                Place of Supply: <strong className="text-slate-900 font-bold">{invoice.placeOfSupply || '24-Gujarat'}</strong>
              </p>
            </div>
          </div>

          {/* Billed To Client Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Billed To (B2B / Client)</p>
              <h3 className="text-base font-extrabold text-slate-900">{invoice.customer.name}</h3>
              {invoice.customer.gstin ? (
                <p className="text-xs text-blue-700 font-mono font-bold my-1">
                  GSTIN: {invoice.customer.gstin} {invoice.customer.stateCode ? `(State Code: ${invoice.customer.stateCode})` : ''}
                </p>
              ) : (
                <p className="text-xs text-slate-500 font-mono font-medium">GSTIN: Unregistered Consumer</p>
              )}
              <p className="text-xs text-slate-700 mt-0.5 font-medium">{invoice.customer.email}</p>
              {invoice.customer.phone && <p className="text-xs text-slate-600 font-medium">{invoice.customer.phone}</p>}
              {invoice.customer.address && <p className="text-xs text-slate-600 mt-2 max-w-xs">{invoice.customer.address}</p>}
            </div>

            <div className="md:text-right flex flex-col justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Grand Total (Incl. GST)</p>
                <p className="text-3xl font-extrabold text-emerald-700">{formatINR(invoice.total)}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 text-xs">
                <div className="flex justify-between md:justify-end gap-4 text-slate-600 font-medium">
                  <span>Paid Received:</span>
                  <strong className="text-emerald-700 font-bold">{formatINR(totalPaid)}</strong>
                </div>
                <div className="flex justify-between md:justify-end gap-4 text-slate-900 font-extrabold mt-1">
                  <span>Balance Amount Payable:</span>
                  <strong className={balanceDue > 0 ? 'text-amber-700' : 'text-slate-600'}>
                    {formatINR(balanceDue)}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table with HSN/SAC Column */}
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 mb-3 uppercase tracking-wider">Goods & Services Particulars</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="text-[11px] uppercase tracking-wider text-slate-700 bg-slate-100 border-b border-slate-200 font-extrabold">
                  <tr>
                    <th className="py-3.5 px-4">Item Description</th>
                    <th className="py-3.5 px-4 font-mono">HSN / SAC</th>
                    <th className="py-3.5 px-4 text-center">Qty</th>
                    <th className="py-3.5 px-4 text-right">Unit Rate (₹)</th>
                    <th className="py-3.5 px-4 text-right">Taxable Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.description}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{item.hsnSac || '998311'}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-right text-slate-700 font-medium">{formatINR(item.unitPrice)}</td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">{formatINR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* GST Tax Calculation Summary Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div>
              {invoice.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Payment Instructions & Terms</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total Taxable Subtotal:</span>
                <span className="font-bold text-slate-900">{formatINR(invoice.subtotal)}</span>
              </div>

              {!invoice.isInterState ? (
                <>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Central GST (CGST {invoice.taxRate / 2}%):</span>
                    <span className="font-bold text-slate-900">{formatINR(invoice.cgst || invoice.tax / 2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>State GST (SGST {invoice.taxRate / 2}%):</span>
                    <span className="font-bold text-slate-900">{formatINR(invoice.sgst || invoice.tax / 2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-purple-800 font-bold">
                  <span>Integrated GST (IGST {invoice.taxRate}%):</span>
                  <span>{formatINR(invoice.igst || invoice.tax)}</span>
                </div>
              )}

              <div className="flex justify-between text-blue-700 font-bold pt-1 border-t border-slate-200">
                <span>Total GST Amount ({invoice.taxRate}%):</span>
                <span>{formatINR(invoice.tax)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
                <span>Grand Total (INR ₹):</span>
                <span className="text-emerald-700 text-base">{formatINR(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Receipts Log */}
          {invoice.payments.length > 0 && (
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Settlement & Payment Receipts</h4>
              <div className="space-y-2">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{p.method} Received</span>
                      <span className="text-slate-600 font-medium">on {new Date(p.paidAt).toLocaleDateString()}</span>
                    </div>
                    <span className="font-extrabold text-emerald-800 text-sm">+{formatINR(p.amount)}</span>
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
