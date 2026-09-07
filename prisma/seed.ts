import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding Neon Postgres database...');

  // Ensure tables exist
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" TEXT DEFAULT 'ADMIN',
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Customer" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "address" TEXT,
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    );

    DO $$ BEGIN
      CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    CREATE TABLE IF NOT EXISTS "Invoice" (
      "id" TEXT PRIMARY KEY,
      "invoiceNumber" TEXT UNIQUE NOT NULL,
      "customerId" TEXT NOT NULL REFERENCES "Customer"("id") ON DELETE CASCADE,
      "status" "InvoiceStatus" DEFAULT 'DRAFT',
      "issueDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "dueDate" TIMESTAMP(3) NOT NULL,
      "subtotal" DOUBLE PRECISION NOT NULL,
      "taxRate" DOUBLE PRECISION DEFAULT 0.0,
      "tax" DOUBLE PRECISION DEFAULT 0.0,
      "total" DOUBLE PRECISION NOT NULL,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "InvoiceItem" (
      "id" TEXT PRIMARY KEY,
      "invoiceId" TEXT NOT NULL REFERENCES "Invoice"("id") ON DELETE CASCADE,
      "description" TEXT NOT NULL,
      "quantity" INTEGER NOT NULL,
      "unitPrice" DOUBLE PRECISION NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "Payment" (
      "id" TEXT PRIMARY KEY,
      "invoiceId" TEXT NOT NULL REFERENCES "Invoice"("id") ON DELETE CASCADE,
      "amount" DOUBLE PRECISION NOT NULL,
      "method" TEXT NOT NULL,
      "notes" TEXT,
      "paidAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@billing.com' },
    update: {},
    create: {
      id: 'usr-admin-1',
      email: 'admin@billing.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('👤 Admin user created/verified:', admin.email);

  // Create Sample Customers
  const customer1 = await prisma.customer.upsert({
    where: { id: 'cust-101' },
    update: {},
    create: {
      id: 'cust-101',
      name: 'Acme Technologies Inc.',
      email: 'billing@acmetechnologies.com',
      phone: '+1 (555) 019-2831',
      address: '742 Evergreen Terrace, Suite 400, San Francisco, CA 94107',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: 'cust-102' },
    update: {},
    create: {
      id: 'cust-102',
      name: 'Starlight Media House',
      email: 'finance@starlightmedia.io',
      phone: '+1 (555) 048-9120',
      address: '100 Broadway, 12th Floor, New York, NY 10005',
    },
  });

  console.log('🏢 Sample customers created.');

  // Create Sample Invoices
  const inv1 = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-001' },
    update: {},
    create: {
      id: 'inv-101',
      invoiceNumber: 'INV-2026-001',
      customerId: customer1.id,
      status: 'PAID',
      issueDate: new Date('2026-08-01'),
      dueDate: new Date('2026-08-15'),
      subtotal: 3500.0,
      taxRate: 10.0,
      tax: 350.0,
      total: 3850.0,
      notes: 'Thank you for your business!',
    },
  });

  const inv2 = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-002' },
    update: {},
    create: {
      id: 'inv-102',
      invoiceNumber: 'INV-2026-002',
      customerId: customer2.id,
      status: 'SENT',
      issueDate: new Date('2026-09-01'),
      dueDate: new Date('2026-09-20'),
      subtotal: 1800.0,
      taxRate: 8.0,
      tax: 144.0,
      total: 1944.0,
      notes: 'Payment due within 20 days.',
    },
  });

  console.log('📜 Sample invoices created:', inv1.invoiceNumber, inv2.invoiceNumber);

  // Repeatable performance-test data: 30 invoices per year, with real line
  // items and a mix of paid and outstanding balances.
  const years = [2024, 2025, 2026];
  const demoCustomers = await Promise.all(
    years.map((year) =>
      prisma.customer.upsert({
        where: { id: `demo-customer-${year}` },
        update: {},
        create: {
          id: `demo-customer-${year}`,
          name: `Demo Customer ${year}`,
          email: `demo-${year}@example.test`,
          phone: '+1 (555) 010-2026',
          address: `${year} Test Data Avenue, Demo City`,
          createdAt: new Date(`${year}-01-01T09:00:00.000Z`),
        },
      })
    )
  );

  const invoicesPerYear = [47, 47, 46]; // 50 additional records after the initial 90
  const demoInvoices = years.flatMap((year, yearIndex) =>
    Array.from({ length: invoicesPerYear[yearIndex] }, (_, index) => {
      const number = index + 1;
      const month = (index % 12) + 1;
      const issueDate = new Date(Date.UTC(year, month - 1, (index % 25) + 1));
      const dueDate = new Date(Date.UTC(year, month - 1, (index % 25) + 15));
      const subtotal = 500 + number * 25 + yearIndex * 100;
      const tax = Math.round(subtotal * 0.1 * 100) / 100;
      const isPaid = index % 3 === 0;

      return {
        id: `demo-invoice-${year}-${String(number).padStart(3, '0')}`,
        invoiceNumber: `DEMO-${year}-${String(number).padStart(3, '0')}`,
        customerId: demoCustomers[yearIndex].id,
        status: isPaid ? ('PAID' as const) : ('SENT' as const),
        issueDate,
        dueDate,
        subtotal,
        taxRate: 10,
        tax,
        total: subtotal + tax,
        notes: `Generated performance test invoice for ${year}.`,
        createdAt: issueDate,
      };
    })
  );

  await prisma.invoice.createMany({ data: demoInvoices, skipDuplicates: true });
  await prisma.invoiceItem.createMany({
    data: demoInvoices.map((invoice) => ({
      id: `demo-item-${invoice.id}`,
      invoiceId: invoice.id,
      description: 'Demo service subscription',
      quantity: 1,
      unitPrice: invoice.subtotal,
      amount: invoice.subtotal,
    })),
    skipDuplicates: true,
  });
  await prisma.payment.createMany({
    data: demoInvoices
      .filter((_, index) => index % 3 === 0)
      .map((invoice) => ({
        id: `demo-payment-${invoice.id}`,
        invoiceId: invoice.id,
        amount: invoice.total,
        method: 'Bank Transfer',
        notes: 'Generated test payment',
        paidAt: invoice.issueDate,
        createdAt: invoice.issueDate,
      })),
    skipDuplicates: true,
  });
  console.log(`⚡ Performance test data created: ${demoInvoices.length} invoices across 2024–2026.`);
  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
