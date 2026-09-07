import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/invoices/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        items: true,
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch invoice' }, { status: 500 });
  }
}

// PUT /api/invoices/[id] - Update invoice status or details
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, issueDate, dueDate, items, taxRate, notes, customerId } = body;

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (status) updateData.status = status;
    if (issueDate) updateData.issueDate = new Date(issueDate);
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (notes !== undefined) updateData.notes = notes;
    if (customerId) updateData.customerId = customerId;

    // Recalculate totals if items or taxRate changed
    if (items && Array.isArray(items)) {
      let subtotal = 0;
      const newItemsData = items.map((item: any) => {
        const quantity = Math.max(1, parseInt(item.quantity) || 1);
        const unitPrice = Math.max(0, parseFloat(item.unitPrice) || 0);
        const amount = quantity * unitPrice;
        subtotal += amount;
        return {
          description: item.description || 'Item',
          quantity,
          unitPrice,
          amount,
        };
      });

      const currentTaxRate = taxRate !== undefined ? parseFloat(taxRate) : existingInvoice.taxRate;
      const tax = Math.round((subtotal * (currentTaxRate / 100)) * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      updateData.subtotal = subtotal;
      updateData.taxRate = currentTaxRate;
      updateData.tax = tax;
      updateData.total = total;

      // Delete existing line items & replace with updated
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: params.id },
      });

      updateData.items = {
        create: newItemsData,
      };
    } else if (taxRate !== undefined) {
      const currentTaxRate = parseFloat(taxRate);
      const tax = Math.round((existingInvoice.subtotal * (currentTaxRate / 100)) * 100) / 100;
      const total = Math.round((existingInvoice.subtotal + tax) * 100) / 100;
      updateData.taxRate = currentTaxRate;
      updateData.tax = tax;
      updateData.total = total;
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        items: true,
        payments: true,
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to update invoice' }, { status: 500 });
  }
}

// DELETE /api/invoices/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.invoice.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Invoice deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete invoice' }, { status: 500 });
  }
}
