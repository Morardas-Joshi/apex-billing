import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/payments - List all payments with invoice & customer info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoiceId');

    const payments = await prisma.payment.findMany({
      where: invoiceId ? { invoiceId } : undefined,
      select: {
        id: true,
        amount: true,
        method: true,
        paidAt: true,
        notes: true,
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            customer: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    return NextResponse.json(payments, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST /api/payments - Record a payment against an invoice
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invoiceId, amount, method, notes, paidAt } = body;

    if (!invoiceId || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Valid invoice ID and payment amount are required' }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: numericAmount,
        method: method || 'Bank Transfer',
        notes: notes || null,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    });

    // Calculate total paid so far
    const totalPaidSoFar = invoice.payments.reduce((acc, p) => acc + p.amount, 0) + numericAmount;

    // Automatically update invoice status to PAID if fully paid
    if (totalPaidSoFar >= invoice.total) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' },
      });
    } else if (invoice.status === 'DRAFT') {
      // If payment was made on a DRAFT invoice, transition status to SENT or keep active
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'SENT' },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: error.message || 'Failed to record payment' }, { status: 500 });
  }
}
