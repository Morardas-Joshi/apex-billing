import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/invoices - List invoices with filtering, search, and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const query = searchParams.get('q');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = Math.max(1, Number.parseInt(pageParam || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(limitParam || '50', 10) || 50));

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

    const invoiceQuery = {
      where: whereClause,
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issueDate: true,
        dueDate: true,
        subtotal: true,
        tax: true,
        total: true,
        customer: {
          select: { id: true, name: true, email: true },
        },
        payments: {
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    } as const;

    // Preserve the existing array response for payment pickers and dashboard
    // requests. The invoice table opts into paginated results with `page`.
    if (pageParam) {
      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({ ...invoiceQuery, skip: (page - 1) * limit, take: limit }),
        prisma.invoice.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        data: invoices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    }

    const invoices = await prisma.invoice.findMany(invoiceQuery);

    return NextResponse.json(invoices, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
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
