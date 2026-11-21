import { prisma } from "./prisma";

/**
 * Generates a sequential invoice number per year: INV-YYYY-0001
 */
export async function generateInvoiceNo(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  const lastOrder = await prisma.order.findFirst({
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

  if (!lastOrder) {
    return `${prefix}0001`;
  }

  const parts = lastOrder.invoiceNo.split("-");
  const lastSeq = parseInt(parts[2], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;

  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

