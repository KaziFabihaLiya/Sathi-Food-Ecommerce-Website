import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import { getDhakaDateRange } from "@/lib/date";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const { startOfTodayUtc, startOfMonthUtc } = getDhakaDateRange();

    // 1. Orders today in Asia/Dhaka
    const ordersToday = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfTodayUtc,
        },
      },
    });

    // 2. Pending orders count
    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING",
      },
    });

    // 3. Revenue this month in Asia/Dhaka (excluding CANCELLED)
    const revenueAggregate = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
      where: {
        createdAt: {
          gte: startOfMonthUtc,
        },
        status: {
          not: "CANCELLED",
        },
      },
    });

    const revenueThisMonth = revenueAggregate._sum.total || 0;

    // 4. Recent orders with items summary
    const orders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
      },
    });

    const recentOrders = orders.map((order) => {
      const itemsSummary = order.items
        .map((i) => `${i.productName} × ${i.quantity}`)
        .join(", ");

      return {
        id: order.id,
        invoiceNo: order.invoiceNo,
        customerName: order.customerName,
        phone: order.customerPhone,
        itemsSummary,
        total: order.total,
        status: order.status,
      };
    });

    return NextResponse.json({
      ordersToday,
      pendingOrders,
      revenueThisMonth,
      recentOrders,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
