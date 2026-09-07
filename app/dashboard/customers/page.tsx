import prisma from '@/lib/prisma';
import { CustomersClient } from '@/components/CustomersClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CustomersPage() {
  const initialCustomers = await prisma.customer.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      createdAt: true,
      _count: {
        select: { invoices: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formattedCustomers = initialCustomers.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return <CustomersClient initialCustomers={formattedCustomers} />;
}
