import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting demo orders seed...");

  // Ensure products exist
  const goldGhee = await prisma.product.findUnique({ where: { slug: "gold-ghee" } });
  const silkGhee = await prisma.product.findUnique({ where: { slug: "silk-ghee" } });
  const combo = await prisma.product.findUnique({ where: { slug: "gold-silk-combo" } });

  if (!goldGhee || !silkGhee || !combo) {
    throw new Error("Base products not found. Run 'npm run db:seed' first.");
  }

  // 1. Create or reuse Customer
  const phone = "01711000000";
  let customer = await prisma.customer.findFirst({
    where: { phone },
  });

  if (customer) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        name: "Abdur Rahman",
        address: "House 12, Road 5, Dhanmondi",
        district: "Dhaka",
      },
    });
  } else {
    customer = await prisma.customer.create({
      data: {
        name: "Abdur Rahman",
        phone,
        address: "House 12, Road 5, Dhanmondi",
        district: "Dhaka",
      },
    });
  }
  console.log(`✓ Customer ready: ${customer.name} (${customer.phone})`);

  // 2. Create sample orders with sequential invoice numbers
  const currentYear = new Date().getFullYear();

  const demoOrdersData = [
    {
      invoiceNo: `INV-${currentYear}-0001`,
      status: OrderStatus.CONFIRMED,
      note: "Please deliver before 5 PM",
      paymentMethod: "COD",
      items: [
        {
          productId: goldGhee.id,
          productName: goldGhee.name, // snapshot
          unitPrice: goldGhee.price,   // snapshot
          quantity: 2,
        },
      ],
      total: goldGhee.price * 2,
    },
    {
      invoiceNo: `INV-${currentYear}-0002`,
      status: OrderStatus.PENDING,
      note: "Call on arrival",
      paymentMethod: "COD",
      items: [
        {
          productId: combo.id,
          productName: combo.name, // snapshot
          unitPrice: combo.price,   // snapshot
          quantity: 1,
        },
      ],
      total: combo.price * 1,
    },
  ];

  for (const orderData of demoOrdersData) {
    const existingOrder = await prisma.order.findUnique({
      where: { invoiceNo: orderData.invoiceNo },
    });

    if (existingOrder) {
      console.log(`- Order ${orderData.invoiceNo} already exists, skipping.`);
      continue;
    }

    const order = await prisma.order.create({
      data: {
        invoiceNo: orderData.invoiceNo,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        customerDistrict: customer.district,
        note: orderData.note,
        paymentMethod: orderData.paymentMethod,
        status: orderData.status,
        total: orderData.total,
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    console.log(`✓ Seeded demo order: ${order.invoiceNo} (Total: ${order.total} BDT)`);
  }

  console.log("✅ Demo orders seed completed.");
}

main()
  .catch((e) => {
    console.error("❌ Error during demo seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
