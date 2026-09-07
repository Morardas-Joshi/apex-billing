import prisma from '@/lib/prisma';
import { InvoicesClient } from '@/components/InvoicesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InvoicesPage() {
  const [invoices, totalInvoices] = await Promise.all([
    prisma.invoice.findMany({
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      issueDate: true,
      dueDate: true,
      subtotal: true,
      tax: true,
      total: true,
      customer: { select: { id: true, name: true, email: true } },
      payments: { select: { amount: true } },
    },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.invoice.count(),
  ]);

  const initialInvoices = invoices.map((invoice) => ({
    ...invoice,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
  }));

  return <InvoicesClient initialInvoices={initialInvoices} initialTotal={totalInvoices} />;
}
