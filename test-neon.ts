import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';

async function testNeon() {
  console.log('Testing Neon connection via WebSocket adapter...');
  try {
    // 1. Raw SQL query via Neon adapter to create tables over WebSocket (port 443)
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

      CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE');

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

    console.log('✅ Tables created/verified in Neon Postgres!');

    // 2. Seed Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
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

    console.log('👤 Admin user created/verified in Neon: admin@billing.com / admin123');

    // 3. Seed Sample Customer
    const cust = await prisma.customer.upsert({
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

    console.log('🏢 Sample Customer created:', cust.name);

    // 4. Seed Sample Invoice
    await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-001' },
      update: {},
      create: {
        id: 'inv-101',
        invoiceNumber: 'INV-2026-001',
        customerId: cust.id,
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

    console.log('📜 Sample Invoice created: INV-2026-001');
    console.log('🎉 Neon database setup & seeding complete over WebSocket!');
  } catch (err) {
    console.error('Error during Neon test:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testNeon();
