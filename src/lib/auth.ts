import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Helper for route handlers to verify admin session.
 * Returns the session if authenticated, or null if unauthorized.
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return session;
}

/**
 * Standard 401 Unauthorized JSON response helper.
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

