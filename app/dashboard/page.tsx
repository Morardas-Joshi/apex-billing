'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  Plus,
  ArrowRight,
  CreditCard,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentModal } from '@/components/PaymentModal';

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
      <Navbar title="Executive Dashboard" subtitle="Real-time revenue metrics, outstanding balances, and recent invoices" />

      <main className="p-8 space-y-8 flex-1 overflow-y-auto">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Financial Summary</h1>
            <p className="text-xs text-slate-400">Overview of active billing accounts and monthly cash flow</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              title="Refresh Data"
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={openPaymentModal}
              className="px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </button>

            <Link
              href="/dashboard/invoices/create"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Invoice</span>
            </Link>
          </div>
        </div>

        {/* Core Metric Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Outstanding"
            value={stats ? `$${stats.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
            icon={DollarSign}
            accentColor="amber"
            subtitle="Pending receivables"
            trend={stats ? `${stats.statusCounts.SENT + stats.statusCounts.OVERDUE} unpaid invoices` : ''}
          />
          <StatCard
            title="Paid This Month"
            value={stats ? `$${stats.totalPaidThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'}
            icon={TrendingUp}
            accentColor="emerald"
            subtitle="Collected revenue"
            trend="Current calendar month"
          />
          <StatCard
            title="Total Invoices"
            value={stats ? stats.totalInvoices : 0}
            icon={FileText}
            accentColor="indigo"
            subtitle="All time created"
            trend={stats ? `${stats.statusCounts.PAID} fully settled` : ''}
          />
          <StatCard
            title="Active Customers"
            value={stats ? stats.totalCustomers : 0}
            icon={Users}
            accentColor="purple"
            subtitle="Registered client profiles"
          />
        </div>

        {/* Invoice Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-100">Recent Invoices</h3>
                <p className="text-xs text-slate-400">Latest billing activity across clients</p>
              </div>
              <Link
                href="/dashboard/invoices"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline"
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
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-900/60 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stats.recentInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-100">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-medium text-slate-200">{inv.customerName}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-100">${inv.total.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={inv.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/dashboard/invoices/${inv.id}`}
                            className="p-1.5 inline-flex items-center gap-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
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
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-100 mb-1">Invoice Status Distribution</h3>
              <p className="text-xs text-slate-400 mb-6">Current count by lifecycle status</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <StatusBadge status="DRAFT" />
                  <span className="font-bold text-slate-200 text-sm">{stats?.statusCounts.DRAFT || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <StatusBadge status="SENT" />
                  <span className="font-bold text-slate-200 text-sm">{stats?.statusCounts.SENT || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <StatusBadge status="PAID" />
                  <span className="font-bold text-slate-200 text-sm">{stats?.statusCounts.PAID || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <StatusBadge status="OVERDUE" />
                  <span className="font-bold text-slate-200 text-sm">{stats?.statusCounts.OVERDUE || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-xs">
              <p className="text-indigo-300 font-semibold mb-1">💡 Quick Tip</p>
              <p className="text-slate-400">
                Recording a payment against an invoice automatically updates its status to <strong className="text-emerald-400">PAID</strong> when fully settled.
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
