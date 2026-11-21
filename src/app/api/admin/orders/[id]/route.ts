import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export async function GET(req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Return the exact structure expected by frontend OrderDetailData:
    // { id, invoiceNo, customerName, phone, address, district, note, paymentMethod, status, total, createdAt, items: [{ id, productName, unitPrice, quantity }] }
    return NextResponse.json({
      id: order.id,
      invoiceNo: order.invoiceNo,
      customerName: order.customerName,
      phone: order.customerPhone,
      address: order.customerAddress,
      district: order.customerDistrict,
      note: order.note,
      paymentMethod: order.paymentMethod,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error(`GET /api/admin/orders/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    const parsed = updateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order status provided" },
        { status: 400 }
      );
    }

    const { status: newStatus } = parsed.data;

    // Execute status transition and inventory adjustment in a single atomic transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      const currentStatus = order.status;

      // 1. Transition TO CANCELLED from any other status -> Restock items
      if (currentStatus !== OrderStatus.CANCELLED && newStatus === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }
      // 2. Transition FROM CANCELLED to any other status -> Decrement stock again (reject if insufficient)
      else if (currentStatus === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          if (item.productId) {
            const product = await tx.product.findUnique({
              where: { id: item.productId },
            });

            if (!product || product.stock < item.quantity) {
              throw new Error(
                `Insufficient stock to uncancel order. Product "${item.productName}" has ${product?.stock ?? 0} available, need ${item.quantity}.`
              );
            }

            const stockUpdate = await tx.product.updateMany({
              where: {
                id: item.productId,
                stock: { gte: item.quantity },
              },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            });

            if (stockUpdate.count === 0) {
              throw new Error(
                `Stock changed during uncancel. Could not allocate ${item.quantity} units of "${item.productName}".`
              );
            }
          }
        }
      }
      // 3. Any other transition -> no stock change

      // Update status
      return tx.order.update({
        where: { id },
        data: {
          status: newStatus,
        },
        include: {
          items: true,
        },
      });
    });

    return NextResponse.json({
      id: updatedOrder.id,
      invoiceNo: updatedOrder.invoiceNo,
      customerName: updatedOrder.customerName,
      phone: updatedOrder.customerPhone,
      address: updatedOrder.customerAddress,
      district: updatedOrder.customerDistrict,
      note: updatedOrder.note,
      paymentMethod: updatedOrder.paymentMethod,
      status: updatedOrder.status,
      total: updatedOrder.total,
      createdAt: updatedOrder.createdAt.toISOString(),
      items: updatedOrder.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "ORDER_NOT_FOUND") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const message = error instanceof Error ? error.message : "Failed to update order status";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
