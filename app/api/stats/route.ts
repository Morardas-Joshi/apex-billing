import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all invoices with payments
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          select: { name: true, email: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalCustomers = await prisma.customer.count();

    // Check & auto-update overdue status for unpaid invoices past due date
    const overdueUpdates = invoices
      .filter((inv) => inv.status !== 'PAID' && new Date(inv.dueDate) < now && inv.status !== 'OVERDUE')
      .map((inv) => prisma.invoice.update({ where: { id: inv.id }, data: { status: 'OVERDUE' } }));

    if (overdueUpdates.length > 0) {
      await Promise.all(overdueUpdates);
    }

    let totalOutstanding = 0;
    let draftCount = 0;
    let sentCount = 0;
    let paidCount = 0;
    let overdueCount = 0;

    invoices.forEach((inv) => {
      const paid = inv.payments.reduce((acc, p) => acc + p.amount, 0);
      const remaining = Math.max(0, inv.total - paid);

      if (inv.status === 'PAID') {
        paidCount += 1;
      } else {
        totalOutstanding += remaining;
        if (inv.status === 'DRAFT') draftCount += 1;
        else if (inv.status === 'SENT') sentCount += 1;
        else if (inv.status === 'OVERDUE' || new Date(inv.dueDate) < now) overdueCount += 1;
      }
    });

    // Total paid this month
    const paymentsThisMonth = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        paidAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    const totalPaidThisMonth = paymentsThisMonth._sum.amount || 0;

    const recentInvoices = invoices.slice(0, 5).map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer.name,
      total: inv.total,
      status: inv.status,
      dueDate: inv.dueDate,
    }));

    return NextResponse.json({
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      totalPaidThisMonth: Math.round(totalPaidThisMonth * 100) / 100,
      totalCustomers,
      totalInvoices: invoices.length,
      statusCounts: {
        DRAFT: draftCount,
        SENT: sentCount,
        PAID: paidCount,
        OVERDUE: overdueCount,
      },
      recentInvoices,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
