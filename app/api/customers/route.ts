import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/customers - List all customers with optional search & invoice counts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const customers = await prisma.customer.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
              { gstin: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
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

    return NextResponse.json(customers, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST /api/customers - Create new customer with GSTIN details
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, gstin, state, stateCode } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        address: address || null,
        gstin: gstin ? gstin.toUpperCase().trim() : null,
        state: state || null,
        stateCode: stateCode || null,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: error.message || 'Failed to create customer' }, { status: 500 });
  }
}
