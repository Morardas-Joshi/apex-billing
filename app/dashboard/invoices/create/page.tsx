'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Building,
  Calendar,
  FileText,
  DollarSign,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CustomerModal } from '@/components/CustomerModal';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<LineItem[]>([
    { description: 'Web Application Development Services', quantity: 1, unitPrice: 1500 },
  ]);
  const [taxRate, setTaxRate] = useState<number>(10);
  const [notes, setNotes] = useState('Thank you for choosing Apex Billing! Payment due within terms.');
  const [status, setStatus] = useState<'DRAFT' | 'SENT'>('SENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Customer Creation Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (res.ok) {
        setCustomers(data);
        if (data.length > 0 && !customerId) {
          setCustomerId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...items];
    if (field === 'quantity') {
      updated[index][field] = Math.max(1, parseInt(value) || 1);
    } else if (field === 'unitPrice') {
      updated[index][field] = Math.max(0, parseFloat(value) || 0);
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  // Real-time calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tax = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Please select or add a customer');
      return;
    }

    if (items.some((i) => !i.description.trim())) {
      setError('All line items must have a description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          issueDate,
          dueDate,
          items,
          taxRate,
          notes,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invoice');
      }

      router.push(`/dashboard/invoices/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="Create Invoice" subtitle="Generate a new billing invoice with automated tax calculations" />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/invoices"
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Customer & Dates Card */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <span>Invoice Client Details</span>
              </h2>

              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Customer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Select Customer *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm text-slate-100 focus:outline-none focus:border-indigo-500 bg-slate-900"
                >
                  {customers.length === 0 ? (
                    <option value="">No customers found. Add one!</option>
                  ) : (
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Line Items Section */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Line Items</span>
              </h2>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-[11px] uppercase tracking-wider font-semibold text-slate-400 px-2">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price ($)</div>
                <div className="col-span-2 text-right">Amount ($)</div>
              </div>

              {items.map((item, index) => {
                const itemAmount = item.quantity * item.unitPrice;

                return (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Item or service description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-slate-100 text-center focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg glass-input text-xs text-slate-100 text-right focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="font-bold text-slate-100 text-xs">${itemAmount.toFixed(2)}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations & Notes Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Invoice Notes / Payment Terms
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Terms, bank account details, wire info..."
                  className="w-full p-3 rounded-xl glass-input text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-100">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>Tax Rate (%)</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-100 text-center"
                    />
                  </div>
                  <span className="font-bold text-slate-100">${tax.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-base font-extrabold text-white">
                  <span>Total Due</span>
                  <span className="text-indigo-400 text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-400">Save Initial Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
              >
                <option value="SENT">Issued / Sent</option>
                <option value="DRAFT">Save as Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/invoices"
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Generate Invoice</span>
              </button>
            </div>
          </div>
        </form>
      </main>

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={fetchCustomers}
      />
    </>
  );
}
