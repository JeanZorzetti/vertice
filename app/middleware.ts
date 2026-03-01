import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const COOKIE_NAME = "vertice_session";

// ─── Subdomain detection ─────────────────────────────────────────────────────
// Extracts the agency slug from a subdomain, e.g.:
//   "roi-labs.vertice.roilabs.com.br" → "roi-labs"  (when BASE_DOMAIN = "vertice.roilabs.com.br")
//   "roi-labs.localhost"              → "roi-labs"  (when BASE_DOMAIN = "localhost:3000")
function getAgencySlug(host: string | null): string | null {
  if (!host) return null;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  if (!baseDomain) return null;

  const hostBase = host.split(":")[0]; // strip port
  const domainBase = baseDomain.split(":")[0];
  const suffix = `.${domainBase}`;

  if (!hostBase.endsWith(suffix)) return null;

  const slug = hostBase.slice(0, hostBase.length - suffix.length);
  // Must be a simple segment — no dots, min 2 chars
  if (!slug || slug.includes(".") || slug.length < 2) return null;
  return slug;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host");

  // ── Inject x-agency-slug for all routes ─────────────────────────────────
  const agencySlug = getAgencySlug(host);
  const requestHeaders = new Headers(request.headers);
  if (agencySlug) {
    requestHeaders.set("x-agency-slug", agencySlug);
  }

  // ── Agency admin routes (/admin/*) ──────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const session = await verifyToken(token);
    if (!session || session.type !== "agency") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Client onboarding routes (/onboarding/*) ─────────────────────────────
  if (pathname.startsWith("/onboarding") && !pathname.startsWith("/onboarding/verify")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const session = await verifyToken(token);
    if (!session || session.type !== "client") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // Pass modified headers for all other routes (e.g. /login reads x-agency-slug)
  if (agencySlug) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/onboarding/:path*",
    "/login",
    // Exclude static files and API health to keep latency low
    "/((?!_next/static|_next/image|favicon.ico|api/health).*)",
  ],
};
