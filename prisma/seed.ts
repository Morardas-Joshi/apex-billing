import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🇮🇳 Seeding Indian GST Billing Database...');

  // Ensure tables exist with GST columns
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "password" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "role" TEXT DEFAULT 'ADMIN',
      "gstin" TEXT,
      "state" TEXT DEFAULT 'Maharashtra',
      "stateCode" TEXT DEFAULT '27',
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gstin" TEXT;
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "state" TEXT DEFAULT 'Maharashtra';
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stateCode" TEXT DEFAULT '27';

    CREATE TABLE IF NOT EXISTS "Customer" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "address" TEXT,
      "gstin" TEXT,
      "state" TEXT,
      "stateCode" TEXT,
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "gstin" TEXT;
    ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "state" TEXT;
    ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "stateCode" TEXT;

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
      "taxRate" DOUBLE PRECISION DEFAULT 18.0,
      "tax" DOUBLE PRECISION DEFAULT 0.0,
      "cgst" DOUBLE PRECISION DEFAULT 0.0,
      "sgst" DOUBLE PRECISION DEFAULT 0.0,
      "igst" DOUBLE PRECISION DEFAULT 0.0,
      "isInterState" BOOLEAN DEFAULT FALSE,
      "placeOfSupply" TEXT DEFAULT '27-Maharashtra',
      "total" DOUBLE PRECISION NOT NULL,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "cgst" DOUBLE PRECISION DEFAULT 0.0;
    ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "sgst" DOUBLE PRECISION DEFAULT 0.0;
    ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "igst" DOUBLE PRECISION DEFAULT 0.0;
    ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "isInterState" BOOLEAN DEFAULT FALSE;
    ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "placeOfSupply" TEXT DEFAULT '27-Maharashtra';

    CREATE TABLE IF NOT EXISTS "InvoiceItem" (
      "id" TEXT PRIMARY KEY,
      "invoiceId" TEXT NOT NULL REFERENCES "Invoice"("id") ON DELETE CASCADE,
      "description" TEXT NOT NULL,
      "hsnSac" TEXT DEFAULT '998311',
      "quantity" INTEGER NOT NULL,
      "unitPrice" DOUBLE PRECISION NOT NULL,
      "amount" DOUBLE PRECISION NOT NULL
    );

    ALTER TABLE "InvoiceItem" ADD COLUMN IF NOT EXISTS "hsnSac" TEXT DEFAULT '998311';

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
    update: {
      gstin: '27AAAAA0000A1Z5',
      state: 'Maharashtra',
      stateCode: '27',
    },
    create: {
      id: 'usr-admin-1',
      email: 'admin@billing.com',
      password: adminPassword,
      name: 'Apex Infotech India Pvt Ltd',
      role: 'ADMIN',
      gstin: '27AAAAA0000A1Z5',
      state: 'Maharashtra',
      stateCode: '27',
    },
  });
  console.log('👤 Indian Admin Business initialized:', admin.name, '| GSTIN:', admin.gstin);

  // Create Sample Indian Customers
  const cust1 = await prisma.customer.upsert({
    where: { id: 'cust-101' },
    update: {
      name: 'Tata Consultancy Services Ltd',
      email: 'accounts@tcs.com',
      phone: '+91 98200 12345',
      address: 'TCS House, Raveline Street, Fort, Mumbai, Maharashtra 400001',
      gstin: '27AAACT2727Q1ZW',
      state: 'Maharashtra',
      stateCode: '27',
    },
    create: {
      id: 'cust-101',
      name: 'Tata Consultancy Services Ltd',
      email: 'accounts@tcs.com',
      phone: '+91 98200 12345',
      address: 'TCS House, Raveline Street, Fort, Mumbai, Maharashtra 400001',
      gstin: '27AAACT2727Q1ZW',
      state: 'Maharashtra',
      stateCode: '27',
    },
  });

  const cust2 = await prisma.customer.upsert({
    where: { id: 'cust-102' },
    update: {
      name: 'Infosys Limited',
      email: 'finance@infosys.com',
      phone: '+91 80 2852 0261',
      address: 'Electronics City, Hosur Road, Bengaluru, Karnataka 560100',
      gstin: '29AAACI4848L1ZI',
      state: 'Karnataka',
      stateCode: '29',
    },
    create: {
      id: 'cust-102',
      name: 'Infosys Limited',
      email: 'finance@infosys.com',
      phone: '+91 80 2852 0261',
      address: 'Electronics City, Hosur Road, Bengaluru, Karnataka 560100',
      gstin: '29AAACI4848L1ZI',
      state: 'Karnataka',
      stateCode: '29',
    },
  });

  console.log('🏢 Sample Indian customers created with GSTIN details.');

  // Create GST Tax Invoices
  // Invoice 1: Intra-State (Maharashtra to Maharashtra -> CGST 9% + SGST 9%)
  const sub1 = 150000.0;
  const cgst1 = 13500.0; // 9%
  const sgst1 = 13500.0; // 9%
  const tax1 = 27000.0;  // 18% Total GST
  const tot1 = 177000.0;

  const inv1 = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-001' },
    update: {},
    create: {
      id: 'inv-101',
      invoiceNumber: 'INV-2026-001',
      customerId: cust1.id,
      status: 'PAID',
      issueDate: new Date('2026-08-01'),
      dueDate: new Date('2026-08-15'),
      subtotal: sub1,
      taxRate: 18.0,
      tax: tax1,
      cgst: cgst1,
      sgst: sgst1,
      igst: 0.0,
      isInterState: false,
      placeOfSupply: '27-Maharashtra',
      total: tot1,
      notes: 'Terms: 18% GST Applicable. Payment received via UPI/NEFT. Thank you!',
      items: {
        create: [
          {
            description: 'Enterprise Cloud ERP Customization',
            hsnSac: '998311',
            quantity: 1,
            unitPrice: 100000.0,
            amount: 100000.0,
          },
          {
            description: 'Annual Maintenance Contract (Q3)',
            hsnSac: '998313',
            quantity: 1,
            unitPrice: 50000.0,
            amount: 50000.0,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: tot1,
            method: 'NEFT/RTGS',
            notes: 'HDFC Bank UTR Ref: HDFCN26223019842',
            paidAt: new Date('2026-08-10'),
          },
        ],
      },
    },
  });

  // Invoice 2: Inter-State (Maharashtra to Karnataka -> IGST 18%)
  const sub2 = 80000.0;
  const igst2 = 14400.0; // 18% IGST
  const tax2 = 14400.0;
  const tot2 = 94400.0;

  const inv2 = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-002' },
    update: {},
    create: {
      id: 'inv-102',
      invoiceNumber: 'INV-2026-002',
      customerId: cust2.id,
      status: 'SENT',
      issueDate: new Date('2026-09-01'),
      dueDate: new Date('2026-09-20'),
      subtotal: sub2,
      taxRate: 18.0,
      tax: tax2,
      cgst: 0.0,
      sgst: 0.0,
      igst: igst2,
      isInterState: true,
      placeOfSupply: '29-Karnataka',
      total: tot2,
      notes: 'GST Tax Invoice (Inter-State IGST 18%). Pay via UPI / Bank Transfer.',
      items: {
        create: [
          {
            description: 'Software API Integration & Custom Workflows',
            hsnSac: '998314',
            quantity: 1,
            unitPrice: 80000.0,
            amount: 80000.0,
          },
        ],
      },
    },
  });

  console.log('📜 Indian GST Tax Invoices created:', inv1.invoiceNumber, inv2.invoiceNumber);
  console.log('✅ Indian GST database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
