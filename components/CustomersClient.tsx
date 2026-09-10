'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { CustomerModal } from '@/components/CustomerModal';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  gstin?: string | null;
  state?: string | null;
  stateCode?: string | null;
  createdAt: string | Date;
  _count?: {
    invoices: number;
  };
}

interface CustomersClientProps {
  initialCustomers: Customer[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (res.ok) {
        setCustomers(data);
      }
    } catch (e) {
      console.error('Failed to fetch customers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!search) {
      setCustomers(initialCustomers);
      return;
    }
    const timer = setTimeout(() => {
      fetchCustomers(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, initialCustomers]);

  const handleCreateNew = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete customer "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCustomers(search);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete customer');
      }
    } catch (e: any) {
      alert(e.message || 'Error deleting customer');
    }
  };

  return (
    <>
      <Navbar
        title="GST Customer Directory"
        subtitle="Manage registered clients, GSTIN numbers, state codes, and billing histories"
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="p-8 space-y-6 flex-1 overflow-y-auto bg-slate-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span>Customers ({customers.length})</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Registered GST business accounts</p>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add GST Customer</span>
          </button>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-500 text-xs">Searching GST customer directory...</div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              {search ? 'No customers matching your search filter.' : 'No customers found. Click "Add GST Customer" to add one!'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3.5 px-6">Customer / Firm</th>
                    <th className="py-3.5 px-6">GSTIN No</th>
                    <th className="py-3.5 px-6">State (Code)</th>
                    <th className="py-3.5 px-6">Contact Email & Phone</th>
                    <th className="py-3.5 px-6 text-center">Invoices</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {c.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">{c.name}</p>
                          {c.address && <p className="text-[10px] text-slate-500 truncate max-w-xs">{c.address}</p>}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {c.gstin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-mono text-[11px] font-bold">
                            <FileCheck className="w-3 h-3 text-blue-600" />
                            <span>{c.gstin}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unregistered</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {c.state ? (
                          <span className="text-slate-800 font-semibold">
                            {c.stateCode ? `(${c.stateCode}) ` : ''}{c.state}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 space-y-0.5">
                        <p className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.email}</span>
                        </p>
                        {c.phone && (
                          <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{c.phone}</span>
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>{c._count?.invoices || 0}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            title="Edit Customer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            title="Delete Customer"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchCustomers(search)}
        customerToEdit={editingCustomer}
      />
    </>
  );
}
