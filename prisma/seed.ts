import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting production seed...");

  // 1. Seed Products
  const products = [
    {
      slug: "gold-ghee",
      name: "Gold Ghee",
      tagline: "Made from Milk",
      badge: "Made from Milk",
      weightGrams: 500,
      price: 999,
      stock: 48,
      sortOrder: 1,
      imageUrl: "/images/Product-Post-2.jpeg",
      features: [
        "Rich golden color",
        "Aroma of tradition",
        "Perfect for everyday cooking",
        "Nourishing and wholesome",
      ],
      description:
        "Our Gold Ghee is made from fresh cow's milk using the traditional bilona method. Curd is hand-churned to make butter, which is then slow-cooked to perfection.",
    },
    {
      slug: "silk-ghee",
      name: "Silk Ghee",
      tagline: "Made from Cream",
      badge: null,
      weightGrams: 500,
      price: 999,
      stock: 100,
      sortOrder: 2,
      imageUrl: "/images/Product-Post-3.jpeg",
      features: [
        "Silky texture & delicate flavor",
        "Ideal for finishing & gourmet dishes",
        "Rich in healthy fats",
      ],
      description:
        "Our Silk Ghee is crafted from fresh cow's cream. The cream is gently slow-cooked to bring out a smooth texture, delicate aroma, and a silky golden finish.",
    },
    {
      slug: "gold-silk-combo",
      name: "Gold + Silk Combo",
      tagline: "Best of Both",
      badge: null,
      weightGrams: 1000,
      price: 1998,
      stock: 50,
      sortOrder: 3,
      imageUrl: "/images/ProductPost-5.jpeg",
      features: [
        "Gold Ghee 500g + Silk Ghee 500g",
        "Great for gifting",
        "Better value than buying separately",
      ],
      description:
        "Get both jars together: Gold Ghee 500g and Silk Ghee 500g. A great way to try our full range, and a popular pick for gifting.",
    },
  ];

  for (const product of products) {
    const upserted = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        tagline: product.tagline,
        badge: product.badge,
        weightGrams: product.weightGrams,
        price: product.price,
        stock: product.stock,
        sortOrder: product.sortOrder,
        imageUrl: product.imageUrl,
        features: product.features,
        description: product.description,
      },
      create: product,
    });
    console.log(`✓ Seeded product: ${upserted.name} (${upserted.slug})`);
  }

  // 2. Seed AdminUser
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });

  console.log(`✓ Seeded AdminUser: ${admin.email}`);
  console.log("✅ Production seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
