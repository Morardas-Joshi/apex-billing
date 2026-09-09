import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/invoices - List invoices with GST details
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
        { customer: { gstin: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issueDate: true,
        dueDate: true,
        subtotal: true,
        taxRate: true,
        tax: true,
        cgst: true,
        sgst: true,
        igst: true,
        isInterState: true,
        placeOfSupply: true,
        total: true,
        customer: {
          select: { id: true, name: true, email: true, gstin: true, state: true },
        },
        payments: {
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

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

// POST /api/invoices - Create a new Indian GST Tax Invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerId,
      issueDate,
      dueDate,
      items,
      taxRate = 18.0,
      isInterState = false,
      placeOfSupply = '27-Maharashtra',
      notes,
      status = 'DRAFT',
    } = body;

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Customer and at least one line item are required' },
        { status: 400 }
      );
    }

    // Auto-generate GST Tax Invoice Number (e.g. INV-2026-001)
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(3, '0')}`;

    // Calculate item amounts & subtotal
    let subtotal = 0;
    const itemsData = items.map((item: any) => {
      const quantity = Math.max(1, parseInt(item.quantity) || 1);
      const unitPrice = Math.max(0, parseFloat(item.unitPrice) || 0);
      const amount = quantity * unitPrice;
      subtotal += amount;
      return {
        description: item.description || 'Goods / Service Item',
        hsnSac: item.hsnSac || '998311',
        quantity,
        unitPrice,
        amount,
      };
    });

    const calculatedTaxRate = parseFloat(taxRate) || 18.0;
    const totalTaxAmount = Math.round(subtotal * (calculatedTaxRate / 100) * 100) / 100;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      // Inter-State Sale (IGST applies at full GST rate)
      igst = totalTaxAmount;
    } else {
      // Intra-State Sale (CGST + SGST split 50/50)
      cgst = Math.round((totalTaxAmount / 2) * 100) / 100;
      sgst = Math.round((totalTaxAmount / 2) * 100) / 100;
    }

    const total = Math.round((subtotal + totalTaxAmount) * 100) / 100;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        status,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        subtotal,
        taxRate: calculatedTaxRate,
        tax: totalTaxAmount,
        cgst,
        sgst,
        igst,
        isInterState,
        placeOfSupply,
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
    console.error('Error creating GST invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
