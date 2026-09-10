import prisma from '@/lib/prisma';
import { InvoicesClient } from '@/components/InvoicesClient';

export default async function InvoicesPage() {
  let initialInvoices: any[] = [];
  let initialTotal = 0;

  try {
    const [rawInvoices, count] = await Promise.all([
      prisma.invoice.findMany({
        include: {
          customer: true,
          payments: {
            select: { amount: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.invoice.count(),
    ]);

    initialTotal = count;
    initialInvoices = rawInvoices.map((inv) => ({
      ...inv,
      issueDate: inv.issueDate.toISOString(),
      dueDate: inv.dueDate.toISOString(),
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
    }));
  } catch (e) {
    console.error('Error loading initial invoices on server:', e);
  }

  return <InvoicesClient initialInvoices={initialInvoices} initialTotal={initialTotal} />;
}
