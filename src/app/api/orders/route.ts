import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendOrderNotificationEmail } from "@/lib/mail";

const createOrderSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .min(1, "Quantity must be at least 1")
    .max(20, "Quantity cannot exceed 20"),
  name: z.string().min(1, "Name is required").max(100),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Phone number must be a valid 11-digit Bangladeshi number (e.g., 01712345678)"),
  address: z.string().min(1, "Address is required").max(300),
  district: z.string().min(1, "District is required").max(100),
  note: z.string().max(500).optional().nullable(),
  website: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    // 1. Rate limiting (5 requests/min per IP)
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(ip, 5, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Parse & validate body
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { productId, quantity, name, phone, address, district, note, website } = parsed.data;

    // 3. Honeypot check: if filled, return fake 201 without storing
    if (website && website.trim().length > 0) {
      const fakeYear = new Date().getFullYear();
      return NextResponse.json(
        {
          invoiceNo: `INV-${fakeYear}-0000`,
          total: 0,
        },
        { status: 201 }
      );
    }

    // 4. Single atomic Prisma transaction
    const order = await prisma.$transaction(async (tx) => {
      // Find and validate product
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product || !product.active) {
        throw new Error("Product is not available for purchase");
      }

      if (product.stock < quantity) {
        throw new Error("Insufficient stock available for this product");
      }

      // Decrement stock atomically
      const stockUpdate = await tx.product.updateMany({
        where: {
          id: productId,
          stock: { gte: quantity },
          active: true,
        },
        data: {
          stock: { decrement: quantity },
        },
      });

      if (stockUpdate.count === 0) {
        throw new Error("Stock was modified or is insufficient; please try again");
      }

      // Upsert Customer (reuse existing customer by phone and update address)
      let customer = await tx.customer.findFirst({
        where: { phone },
      });

      if (customer) {
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name,
            address,
            district,
          },
        });
      } else {
        customer = await tx.customer.create({
          data: {
            name,
            phone,
            address,
            district,
          },
        });
      }

      // Generate sequential invoiceNo: INV-YYYY-0001
      const currentYear = new Date().getFullYear();
      const prefix = `INV-${currentYear}-`;

      const lastOrder = await tx.order.findFirst({
        where: {
          invoiceNo: {
            startsWith: prefix,
          },
        },
        orderBy: {
          invoiceNo: "desc",
        },
        select: {
          invoiceNo: true,
        },
      });

      let nextSeq = 1;
      if (lastOrder) {
        const parts = lastOrder.invoiceNo.split("-");
        const seqNum = parseInt(parts[2], 10);
        if (!isNaN(seqNum)) {
          nextSeq = seqNum + 1;
        }
      }

      const invoiceNo = `${prefix}${String(nextSeq).padStart(4, "0")}`;
      const total = product.price * quantity;

      // Create Order + OrderItem snapshot
      return tx.order.create({
        data: {
          invoiceNo,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          customerDistrict: customer.district,
          note: note || null,
          paymentMethod: "COD",
          status: "PENDING",
          total,
          items: {
            create: {
              productId: product.id,
              productName: product.name, // snapshot
              unitPrice: product.price,   // snapshot
              quantity,
            },
          },
        },
        include: {
          items: true,
        },
      });
    });

    // 5. Send notification email after commit (never fail order if email fails)
    sendOrderNotificationEmail({
      id: order.id,
      invoiceNo: order.invoiceNo,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      customerDistrict: order.customerDistrict,
      total: order.total,
      note: order.note,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    }).catch((err) => {
      console.error("Order notification email background error:", err);
    });

    // 6. Respond 201 with invoiceNo and total
    return NextResponse.json(
      {
        invoiceNo: order.invoiceNo,
        total: order.total,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/orders error:", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
