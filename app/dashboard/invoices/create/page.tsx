'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Building,
  FileText,
  Loader2,
  FileCheck,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CustomerModal } from '@/components/CustomerModal';
import { formatINR, INDIAN_STATES } from '@/lib/formatters';

interface Customer {
  id: string;
  name: string;
  email: string;
  gstin?: string | null;
  state?: string | null;
  stateCode?: string | null;
}

interface LineItem {
  description: string;
  hsnSac: string;
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
    { description: 'Enterprise Cloud Application Consultancy', hsnSac: '998311', quantity: 1, unitPrice: 100000 },
  ]);

  // GST State Parameters
  const [taxRate, setTaxRate] = useState<number>(18);
  const [isInterState, setIsInterState] = useState<boolean>(false);
  const [placeOfSupply, setPlaceOfSupply] = useState<string>('24-Gujarat');
  const [notes, setNotes] = useState('GST Tax Invoice. Terms: 18% GST Applicable. Payment via UPI / Bank Transfer.');
  const [status, setStatus] = useState<'DRAFT' | 'SENT'>('SENT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (res.ok) {
        setCustomers(data);
        if (data.length > 0 && !customerId) {
          setCustomerId(data[0].id);
          checkInterState(data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const checkInterState = (cust: Customer) => {
    if (cust.stateCode && cust.stateCode !== '24') {
      setIsInterState(true);
      setPlaceOfSupply(`${cust.stateCode}-${cust.state || 'Other State'}`);
    } else {
      setIsInterState(false);
      setPlaceOfSupply('24-Gujarat');
    }
  };

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const selected = customers.find((c) => c.id === id);
    if (selected) {
      checkInterState(selected);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', hsnSac: '998311', quantity: 1, unitPrice: 0 }]);
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

  // Real-time GST calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const totalTaxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const cgst = isInterState ? 0 : Math.round((totalTaxAmount / 2) * 100) / 100;
  const sgst = isInterState ? 0 : Math.round((totalTaxAmount / 2) * 100) / 100;
  const igst = isInterState ? totalTaxAmount : 0;
  const total = Math.round((subtotal + totalTaxAmount) * 100) / 100;

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
          isInterState,
          placeOfSupply,
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
      <Navbar title="Create GST Tax Invoice" subtitle="Generate a GST compliant tax invoice with CGST, SGST, IGST, and HSN/SAC codes" />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto max-w-5xl bg-slate-50">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/invoices"
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {error}
            </div>
          )}

          {/* Customer & GST Parameters Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <span>GST Tax Invoice Details</span>
              </h2>

              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New GST Customer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Select Customer *
                </label>
                <select
                  value={customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                >
                  {customers.length === 0 ? (
                    <option value="">No customers found. Add one!</option>
                  ) : (
                    customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.gstin ? `(GSTIN: ${c.gstin})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* GST Tax Type & Place of Supply */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  GST Rate %
                </label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                >
                  <option value={18}>18% GST (Standard Services/Goods)</option>
                  <option value={12}>12% GST</option>
                  <option value={5}>5% GST</option>
                  <option value={28}>28% GST</option>
                  <option value={0}>0% GST (Exempt)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Supply Type
                </label>
                <select
                  value={isInterState ? 'INTER' : 'INTRA'}
                  onChange={(e) => setIsInterState(e.target.value === 'INTER')}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                >
                  <option value="INTRA">Intra-State (CGST {taxRate / 2}% + SGST {taxRate / 2}%)</option>
                  <option value="INTER">Inter-State (IGST {taxRate}%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Place of Supply (State)
                </label>
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={`${s.code}-${s.name}`}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dynamic Line Items Section with HSN/SAC */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Goods / Services Items</span>
              </h2>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-[11px] uppercase tracking-wider font-extrabold text-slate-700 px-2">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">HSN/SAC Code</div>
                <div className="col-span-1 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Rate (₹)</div>
                <div className="col-span-2 text-right">Amount (₹)</div>
              </div>

              {items.map((item, index) => {
                const itemAmount = item.quantity * item.unitPrice;

                return (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Service or product description..."
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="text"
                        placeholder="e.g. 998311"
                        value={item.hsnSac}
                        onChange={(e) => handleItemChange(index, 'hsnSac', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-900 font-bold focus:outline-none focus:border-blue-600 uppercase"
                      />
                    </div>

                    <div className="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 font-bold text-center focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 text-right focus:outline-none focus:border-blue-600 font-bold"
                      />
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className="font-extrabold text-slate-900 text-xs">{formatINR(itemAmount)}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* GST Tax Calculation Breakdown Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-2 uppercase tracking-wider">
                  Terms & Conditions / Bank Details
                </label>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="UPI ID, Bank Account details, Terms..."
                  className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="space-y-2.5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Taxable Amount (Subtotal)</span>
                  <span className="font-extrabold text-slate-900">{formatINR(subtotal)}</span>
                </div>

                {!isInterState ? (
                  <>
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>Central GST (CGST {taxRate / 2}%)</span>
                      <span className="font-bold text-slate-900">{formatINR(cgst)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 font-medium">
                      <span>State GST (SGST {taxRate / 2}%)</span>
                      <span className="font-bold text-slate-900">{formatINR(sgst)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between text-purple-800 font-bold">
                    <span>Integrated GST (IGST {taxRate}%)</span>
                    <span className="font-extrabold">{formatINR(igst)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-blue-700 font-bold pt-2 border-t border-slate-200">
                  <span>Total Tax Amount ({taxRate}%)</span>
                  <span className="font-extrabold text-blue-700">{formatINR(totalTaxAmount)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-base font-extrabold text-slate-900">
                  <span>Grand Total Due (₹)</span>
                  <span className="text-emerald-700 text-lg">{formatINR(total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none"
              >
                <option value="SENT">Issue Tax Invoice</option>
                <option value="DRAFT">Save as Draft</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/invoices"
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Generate GST Tax Invoice</span>
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
