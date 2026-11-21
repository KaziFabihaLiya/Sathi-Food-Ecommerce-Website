import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Public GET /api/reviews returns only active reviews
    const reviews = await prisma.review.findMany({
      where: {
        active: true,
      },
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
