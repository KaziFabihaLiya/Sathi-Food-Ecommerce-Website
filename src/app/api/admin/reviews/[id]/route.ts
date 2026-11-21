import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAdmin, unauthorizedResponse } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

const updateReviewSchema = z.object({
  caption: z.string().nullable().optional(),
  active: z.boolean().optional(),
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
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update data" },
        { status: 400 }
      );
    }

    const updated = await prisma.review.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(`PATCH /api/admin/reviews/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return unauthorizedResponse();
  }

  const { id } = await context.params;

  try {
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
    console.error(`DELETE /api/admin/reviews/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}

