import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const patchReviewSchema = z.object({
  id: z.string().min(1, "Review ID is required"),
  active: z.boolean().optional(),
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    // Admin GET /api/admin/reviews returns ALL reviews (including inactive)
    const reviews = await prisma.review.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const formData = await req.formData();
    // Accept file from field "file" or "image"
    const file = (formData.get("file") || formData.get("image")) as File | null;
    const caption = (formData.get("caption") as string | null) || null;
    const sortOrderRaw = formData.get("sortOrder") as string | null;
    const activeRaw = formData.get("active") as string | null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Image file is required under field 'file'" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image size exceeds 3MB limit" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    const sortOrder = sortOrderRaw !== null ? parseInt(sortOrderRaw, 10) : 0;
    const active = activeRaw !== null ? activeRaw === "true" || activeRaw === "1" : true;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary folder "shathi/reviews"
    const uploadResult = await uploadBufferToCloudinary(buffer, "shathi/reviews");

    const review = await prisma.review.create({
      data: {
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
        caption,
        sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
        active,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const body = await req.json();
    const parsed = patchReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const { id, ...data } = parsed.data;

    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.review.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  try {
    let id: string | null = null;
    try {
      const body = await req.json();
      id = body.id;
    } catch {
      // not JSON body
    }

    if (!id) {
      const { searchParams } = new URL(req.url);
      id = searchParams.get("id");
    }

    if (!id) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    if (review.imagePublicId) {
      await deleteFromCloudinary(review.imagePublicId);
    }

    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
