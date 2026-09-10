import prisma from '@/lib/prisma';
import { CustomersClient } from '@/components/CustomersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomersPage() {
  let formattedCustomers: any[] = [];
  try {
    const initialCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        gstin: true,
        state: true,
        stateCode: true,
        createdAt: true,
        _count: {
          select: { invoices: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    formattedCustomers = initialCustomers.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    }));
  } catch (e) {
    console.error('Error fetching initial customers on server:', e);
  }

  return <CustomersClient initialCustomers={formattedCustomers} />;
}
