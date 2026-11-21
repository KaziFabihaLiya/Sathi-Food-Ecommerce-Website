import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    // Accept file from field "file" or "image"
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Image file is required under field 'file'" },
        { status: 400 }
      );
    }

    // Validate size (max 3MB)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image size exceeds 3MB limit" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary folder "shathi/products"
    const uploadResult = await uploadBufferToCloudinary(buffer, "shathi/products");

    // Delete old image from Cloudinary if present
    if (product.imagePublicId) {
      await deleteFromCloudinary(product.imagePublicId);
    }

    // Update product
    const updated = await prisma.product.update({
      where: { id },
      data: {
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
      },
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
    console.error(`POST /api/admin/products/${id}/image error:`, error);
    return NextResponse.json(
      { error: "Failed to upload product image" },
      { status: 500 }
    );
  }
}
