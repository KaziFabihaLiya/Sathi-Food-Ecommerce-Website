import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    const productsWithStock = products.map((product) => ({
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

    return NextResponse.json(productsWithStock);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
