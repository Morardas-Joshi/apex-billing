'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Building, FileCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INDIAN_STATES } from '@/lib/formatters';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerToEdit?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    gstin?: string | null;
    state?: string | null;
    stateCode?: string | null;
  } | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerToEdit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [state, setState] = useState('Gujarat');
  const [stateCode, setStateCode] = useState('24');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || '');
      setEmail(customerToEdit.email || '');
      setPhone(customerToEdit.phone || '');
      setAddress(customerToEdit.address || '');
      setGstin(customerToEdit.gstin || '');
      setState(customerToEdit.state || 'Gujarat');
      setStateCode(customerToEdit.stateCode || '24');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setGstin('');
      setState('Gujarat');
      setStateCode('24');
    }
    setError(null);
  }, [customerToEdit, isOpen]);

  const handleStateChange = (selectedStateName: string) => {
    setState(selectedStateName);
    const match = INDIAN_STATES.find((s) => s.name === selectedStateName);
    if (match) {
      setStateCode(match.code);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Name and Email are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = customerToEdit ? `/api/customers/${customerToEdit.id}` : '/api/customers';
      const method = customerToEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          address,
          gstin,
          state,
          stateCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save customer');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              <span>{customerToEdit ? 'Edit GST Customer' : 'Add New GST Customer'}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                Company / Customer Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Consultancy Services Ltd"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                  GSTIN (15 Digit GST Number)
                </label>
                <div className="relative">
                  <FileCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="27AAAAA0000A1Z5"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-bold uppercase focus:outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                  State & State Code
                </label>
                <select
                  value={state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.name}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="accounts@tcs.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="+91 98200 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5 uppercase tracking-wider">
                Full Registered Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={3}
                  placeholder="Premises name, street, city, pin code..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{customerToEdit ? 'Save Changes' : 'Create Customer'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
