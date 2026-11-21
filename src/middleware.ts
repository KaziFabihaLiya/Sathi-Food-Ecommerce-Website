import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow access to /admin/login
  if (pathname === "/admin/login") {
    if (req.auth) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  const isAuthenticated = !!req.auth;

  if (!isAuthenticated) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (pathname.startsWith("/admin")) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

