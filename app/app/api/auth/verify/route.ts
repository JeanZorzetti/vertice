import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

// GET /api/auth/verify?token=<uuid>
// Validates the magic link token, marks it as used, creates a session cookie,
// then redirects to the onboarding portal.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=token_missing", request.url));
  }

  try {
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
      include: {
        onboarding: {
          include: { client: true },
        },
      },
    });

    if (!magicLink) {
      return NextResponse.redirect(new URL("/login?error=token_invalid", request.url));
    }

    if (magicLink.usedAt) {
      return NextResponse.redirect(new URL("/login?error=token_used", request.url));
    }

    if (magicLink.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/login?error=token_expired", request.url));
    }

    // Mark token as used
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { usedAt: new Date() },
    });

    // Update onboarding status to IN_PROGRESS on first access
    if (magicLink.onboarding.status === "PENDING") {
      await prisma.onboarding.update({
        where: { id: magicLink.onboarding.id },
        data: { status: "IN_PROGRESS" },
      });
    }

    // Create session cookie
    await setSessionCookie({
      type: "client",
      onboardingId: magicLink.onboarding.id,
      clientId: magicLink.onboarding.clientId,
      email: magicLink.email,
    });

    // Redirect to the onboarding portal
    const redirectUrl = new URL(
      `/onboarding/${magicLink.onboarding.token}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("[verify]", err);
    return NextResponse.redirect(new URL("/login?error=server_error", request.url));
  }
}
