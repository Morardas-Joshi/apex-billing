import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/invoices - List invoices with filtering, search, and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const query = searchParams.get('q');

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (query) {
      whereClause.OR = [
        { invoiceNumber: { contains: query, mode: 'insensitive' } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { customer: { email: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    console.error('Error listing invoices:', error);
    return NextResponse.json({ error: error.message || 'Failed to list invoices' }, { status: 500 });
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, issueDate, dueDate, items, taxRate = 0, notes, status = 'DRAFT' } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer and at least one line item are required' },
        { status: 400 }
      );
    }

    // Auto-generate invoice number if not provided
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(3, '0')}`;

    // Calculate item amounts & totals
    let subtotal = 0;
    const itemsData = items.map((item: any) => {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const unitPrice = Math.max(0, parseFloat(item.unitPrice) || 0);
      const amount = quantity * unitPrice;
      subtotal += amount;
      return {
        description: item.description || 'Service/Product Item',
        quantity,
        unitPrice,
        amount,
      };
    });

    const calculatedTaxRate = parseFloat(taxRate) || 0;
    const tax = Math.round((subtotal * (calculatedTaxRate / 100)) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        status,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default +14 days
        subtotal,
        taxRate: calculatedTaxRate,
        tax,
        total,
        notes: notes || null,
        items: {
          create: itemsData,
        },
      },
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
