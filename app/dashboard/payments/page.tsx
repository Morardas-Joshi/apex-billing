import prisma from '@/lib/prisma';
import { PaymentsClient } from '@/components/PaymentsClient';

export default async function PaymentsPage() {
  let initialPayments: any[] = [];
  try {
    const rawPayments = await prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
      take: 50,
    });

    initialPayments = rawPayments.map((p) => ({
      ...p,
      paidAt: p.paidAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (e) {
    console.error('Error loading initial payments on server:', e);
  }

  return <PaymentsClient initialPayments={initialPayments} />;
}
