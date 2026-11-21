import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";

const updateProductSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").optional(),
  tagline: z.string().min(1, "Tagline cannot be empty").optional(),
  description: z.string().min(1, "Description cannot be empty").optional(),
  features: z.array(z.string()).optional(),
  price: z.number().int().min(0, "Price must be non-negative").optional(),
  weightGrams: z.number().int().min(0, "Weight must be non-negative").optional(),
  stock: z.number().int().min(0, "Stock must be non-negative").optional(),
  active: z.boolean().optional(),
  badge: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updateProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      tagline: updated.tagline,
      description: updated.description,
      features: updated.features,
      price: updated.price,
      weightGrams: updated.weightGrams,
      stock: updated.stock,
      imageUrl: updated.imageUrl,
      badge: updated.badge,
      active: updated.active,
      inStock: updated.stock > 0,
    });
  } catch (error) {
    console.error(`PATCH /api/admin/products/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
