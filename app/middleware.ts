import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const COOKIE_NAME = "vertice_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Agency admin routes (/admin/*) ──────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    // Login page is always public
    if (pathname === "/admin/login") return NextResponse.next();

    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const session = await verifyToken(token);
    if (!session || session.type !== "agency") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Client onboarding routes (/onboarding/*) ────────────────────────────────
  // /onboarding/verify is the magic-link landing — must remain public
  if (pathname.startsWith("/onboarding") && !pathname.startsWith("/onboarding/verify")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const session = await verifyToken(token);
    if (!session || session.type !== "client") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/onboarding/:path*"],
};
