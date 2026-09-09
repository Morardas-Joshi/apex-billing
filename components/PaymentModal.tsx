'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatINR } from '@/lib/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultInvoiceId?: string;
  invoices?: Array<{
    id: string;
    invoiceNumber: string;
    total: number;
    customer: { name: string };
  }>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultInvoiceId,
  invoices = [],
}) => {
  const [invoiceId, setInvoiceId] = useState(defaultInvoiceId || '');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('UPI / QR');
  const [notes, setNotes] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultInvoiceId) {
      setInvoiceId(defaultInvoiceId);
      const selected = invoices.find((i) => i.id === defaultInvoiceId);
      if (selected) {
        setAmount(selected.total.toString());
      }
    } else if (invoices.length > 0 && !invoiceId) {
      setInvoiceId(invoices[0].id);
      setAmount(invoices[0].total.toString());
    }
  }, [defaultInvoiceId, invoices, isOpen]);

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const selected = invoices.find((i) => i.id === id);
    if (selected) {
      setAmount(selected.total.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId || !amount || parseFloat(amount) <= 0) {
      setError('Please select an invoice and enter a valid payment amount');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId,
          amount: parseFloat(amount),
          method,
          notes,
          paidAt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Record Payment (INR ₹)</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Select Invoice *
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={invoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  {invoices.length === 0 ? (
                    <option value="" className="bg-slate-900 text-slate-400">
                      No unpaid invoices available
                    </option>
                  ) : (
                    invoices.map((inv) => (
                      <option key={inv.id} value={inv.id} className="bg-slate-900 text-slate-100">
                        {inv.invoiceNumber} — {inv.customer?.name} ({formatINR(inv.total)})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Payment Amount (₹ INR) *
              </label>
              <div className="relative">
                <span className="text-slate-400 font-bold absolute left-3.5 top-1/2 -translate-y-1/2 text-sm">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Payment Mode
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none focus:border-indigo-500 bg-slate-900"
                >
                  <option value="UPI / QR">UPI / QR Code (GPay / PhonePe / Paytm)</option>
                  <option value="NEFT/RTGS">NEFT / RTGS / IMPS</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit/Debit Card">Credit / Debit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Payment Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                UTR / Reference No / Memo
              </label>
              <textarea
                rows={2}
                placeholder="e.g. UTR Ref HDFCN26223019842, UPI Ref ID..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || invoices.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Record Payment</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
