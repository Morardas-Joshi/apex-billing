import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type DashboardStatsRow = {
  totalOutstanding: number;
  totalPaidThisMonth: number;
  totalCustomers: number;
  totalInvoices: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    total: number;
    status: string;
    dueDate: string;
  }>;
};

export async function GET() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // A single database round trip avoids waiting on several serverless database
    // requests. The CTE also persists overdue statuses without an extra request.
    const [stats] = await prisma.$queryRaw<DashboardStatsRow[]>`
      WITH updated_overdue AS (
        UPDATE "Invoice"
        SET "status" = 'OVERDUE'
        WHERE "status" NOT IN ('PAID', 'OVERDUE') AND "dueDate" < ${now}
        RETURNING "id"
      )
      SELECT
        GREATEST(
          0,
          COALESCE((SELECT SUM(i."total") FROM "Invoice" i WHERE i."status" <> 'PAID'), 0) -
          COALESCE((
            SELECT SUM(p."amount")
            FROM "Payment" p
            INNER JOIN "Invoice" i ON i."id" = p."invoiceId"
            WHERE i."status" <> 'PAID'
          ), 0)
        )::double precision AS "totalOutstanding",
        COALESCE((
          SELECT SUM(p."amount") FROM "Payment" p WHERE p."paidAt" >= ${firstDayOfMonth}
        ), 0)::double precision AS "totalPaidThisMonth",
        (SELECT COUNT(*) FROM "Customer")::int AS "totalCustomers",
        (SELECT COUNT(*) FROM "Invoice")::int AS "totalInvoices",
        COUNT(*) FILTER (WHERE i."status" = 'DRAFT' AND i."dueDate" >= ${now})::int AS "draftCount",
        COUNT(*) FILTER (WHERE i."status" = 'SENT' AND i."dueDate" >= ${now})::int AS "sentCount",
        COUNT(*) FILTER (WHERE i."status" = 'PAID')::int AS "paidCount",
        COUNT(*) FILTER (WHERE i."status" = 'OVERDUE' OR (i."status" <> 'PAID' AND i."dueDate" < ${now}))::int AS "overdueCount",
        COALESCE((
          SELECT json_agg(recent ORDER BY recent."createdAt" DESC)
          FROM (
            SELECT
              i."id", i."invoiceNumber", c."name" AS "customerName",
              i."total",
              CASE WHEN i."status" <> 'PAID' AND i."dueDate" < ${now}
                THEN 'OVERDUE' ELSE i."status"::text END AS "status",
              i."dueDate", i."createdAt"
            FROM "Invoice" i
            INNER JOIN "Customer" c ON c."id" = i."customerId"
            ORDER BY i."createdAt" DESC
            LIMIT 5
          ) recent
        ), '[]'::json) AS "recentInvoices"
      FROM "Invoice" i
    `;

    return NextResponse.json({
      totalOutstanding: Math.round(stats.totalOutstanding * 100) / 100,
      totalPaidThisMonth: Math.round(stats.totalPaidThisMonth * 100) / 100,
      totalCustomers: stats.totalCustomers,
      totalInvoices: stats.totalInvoices,
      statusCounts: {
        DRAFT: stats.draftCount,
        SENT: stats.sentCount,
        PAID: stats.paidCount,
        OVERDUE: stats.overdueCount,
      },
      recentInvoices: stats.recentInvoices,
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
