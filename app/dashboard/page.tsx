import prisma from '@/lib/prisma';
import { DashboardClient } from '@/components/DashboardClient';

export default async function DashboardPage() {
  let initialStats = null;

  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCustomers,
      totalInvoices,
      invoices,
      paymentsThisMonth,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.invoice.count(),
      prisma.invoice.findMany({
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          dueDate: true,
          createdAt: true,
          customer: { select: { name: true } },
          payments: { select: { amount: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paidAt: { gte: firstDayOfMonth } },
      }),
    ]);

    let totalOutstanding = 0;
    const statusCounts = { DRAFT: 0, SENT: 0, PAID: 0, OVERDUE: 0 };

    invoices.forEach((inv) => {
      if (inv.status in statusCounts) {
        statusCounts[inv.status as keyof typeof statusCounts]++;
      }
      const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      const balance = Math.max(0, inv.total - paid);
      if (inv.status !== 'PAID' && balance > 0) {
        totalOutstanding += balance;
      }
    });

    const recentInvoices = invoices.slice(0, 5).map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer?.name || 'Unknown',
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate.toISOString(),
    }));

    initialStats = {
      totalOutstanding,
      totalPaidThisMonth: paymentsThisMonth._sum.amount || 0,
      totalCustomers,
      totalInvoices,
      statusCounts,
      recentInvoices,
    };
  } catch (e) {
    console.error('Error fetching initial dashboard stats on server:', e);
  }

  return <DashboardClient initialStats={initialStats} />;
}
