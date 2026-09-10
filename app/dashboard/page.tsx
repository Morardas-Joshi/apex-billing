'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  FileText,
  Users,
  Plus,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Eye,
  IndianRupee,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentModal } from '@/components/PaymentModal';
import { formatINR } from '@/lib/formatters';

interface StatsData {
  totalOutstanding: number;
  totalPaidThisMonth: number;
  totalCustomers: number;
  totalInvoices: number;
  statusCounts: {
    DRAFT: number;
    SENT: number;
    PAID: number;
    OVERDUE: number;
  };
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    total: number;
    status: string;
    dueDate: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoicesForPayment, setInvoicesForPayment] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoicesForPayment = async () => {
    try {
      const res = await fetch('/api/invoices?status=SENT');
      const data = await res.json();
      if (res.ok) {
        setInvoicesForPayment(data);
      }
    } catch (e) {
      console.error('Failed to fetch unpaid invoices:', e);
    }
  };

  useEffect(() => {
    Promise.all([fetchStats(), fetchInvoicesForPayment()]);
  }, []);

  const openPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };

  return (
    <>
      <Navbar title="Indian GST Dashboard" subtitle="Real-time GST metrics, outstanding balances, and recent tax invoices in INR (₹)" />

      <main className="p-8 space-y-8 flex-1 overflow-y-auto bg-slate-50">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Financial Overview (INR ₹)</h1>
            <p className="text-xs text-slate-500 mt-1">GST billing summary, active clients, and monthly cash flow</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              title="Refresh Data"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openPaymentModal}
              className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>Record Payment</span>
            </button>

            <Link
              href="/dashboard/invoices/create"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>New GST Invoice</span>
            </Link>
          </div>
        </div>

        {/* Core Metric Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Outstanding"
            value={stats ? formatINR(stats.totalOutstanding) : '₹0.00'}
            icon={IndianRupee}
            accentColor="amber"
            subtitle="Pending receivables"
            trend={stats ? `${stats.statusCounts.SENT + stats.statusCounts.OVERDUE} unpaid invoices` : ''}
          />
          <StatCard
            title="Paid This Month"
            value={stats ? formatINR(stats.totalPaidThisMonth) : '₹0.00'}
            icon={TrendingUp}
            accentColor="emerald"
            subtitle="Collected revenue"
            trend="Current calendar month"
          />
          <StatCard
            title="Total Tax Invoices"
            value={stats ? stats.totalInvoices : 0}
            icon={FileText}
            accentColor="indigo"
            subtitle="All time created"
            trend={stats ? `${stats.statusCounts.PAID} fully settled` : ''}
          />
          <StatCard
            title="GST Client Accounts"
            value={stats ? stats.totalCustomers : 0}
            icon={Users}
            accentColor="purple"
            subtitle="Registered client profiles"
          />
        </div>

        {/* Invoice Status Breakdown & Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Tax Invoices</h3>
                <p className="text-xs text-slate-500 mt-0.5">Latest GST billing activity across clients</p>
              </div>
              <Link
                href="/dashboard/invoices"
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Loading recent invoices...</div>
            ) : !stats || stats.recentInvoices.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">No invoices found. Create your first invoice!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{inv.customerName}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">{formatINR(inv.total)}</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={inv.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard/invoices/${inv.id}`}
                            className="p-1.5 inline-flex items-center gap-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Status Breakdown Sidebar Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Invoice Lifecycle Distribution</h3>
              <p className="text-xs text-slate-500 mb-6">Current count by invoice status</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <StatusBadge status="DRAFT" />
                  <span className="font-bold text-slate-900 text-sm">{stats?.statusCounts.DRAFT || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <StatusBadge status="SENT" />
                  <span className="font-bold text-slate-900 text-sm">{stats?.statusCounts.SENT || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <StatusBadge status="PAID" />
                  <span className="font-bold text-slate-900 text-sm">{stats?.statusCounts.PAID || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <StatusBadge status="OVERDUE" />
                  <span className="font-bold text-slate-900 text-sm">{stats?.statusCounts.OVERDUE || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs">
              <p className="text-blue-900 font-bold mb-1">🇮🇳 GST Billing Rules</p>
              <p className="text-slate-600 leading-relaxed">
                Intra-State sales apply <strong className="text-blue-700">CGST (9%) + SGST (9%)</strong> while Inter-State sales apply <strong className="text-indigo-700">IGST (18%)</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          fetchStats();
          fetchInvoicesForPayment();
        }}
        invoices={invoicesForPayment}
      />
    </>
  );
}
