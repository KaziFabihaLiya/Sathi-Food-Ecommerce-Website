import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    const formatted = products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      description: product.description,
      features: product.features,
      price: product.price,
      weightGrams: product.weightGrams,
      stock: product.stock,
      imageUrl: product.imageUrl,
      badge: product.badge,
      active: product.active,
      inStock: product.stock > 0,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
