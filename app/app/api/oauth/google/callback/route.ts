import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOAuthState } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// GET /api/oauth/google/callback?code=...&state=...
// Google redirects here after user grants permissions.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    const redirectTo = state ? await extractOnboardingToken(state) : null;
    const base = redirectTo
      ? `/onboarding/${redirectTo}/platforms`
      : "/onboarding";
    return NextResponse.redirect(
      new URL(`${base}?error=google_cancelled`, APP_URL)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding?error=google_invalid_callback", APP_URL)
    );
  }

  // Verify state JWT
  let onboardingToken: string;
  let onboardingId: string;

  try {
    const payload = await verifyOAuthState(state);
    const rawToken = payload?.["_oauthToken"];
    if (typeof rawToken !== "string" || !rawToken) {
      throw new Error("missing _oauthToken in state");
    }
    onboardingToken = rawToken;

    const onboarding = await prisma.onboarding.findUnique({
      where: { token: onboardingToken },
      select: { id: true },
    });
    if (!onboarding) throw new Error("onboarding not found");
    onboardingId = onboarding.id;
  } catch {
    return NextResponse.redirect(
      new URL("/onboarding?error=google_invalid_state", APP_URL)
    );
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: `${APP_URL}/api/oauth/google/callback`,
      grant_type: "authorization_code",
    }).toString(),
  });

  if (!tokenRes.ok) {
    console.error("[google callback] token exchange failed", await tokenRes.text());
    return NextResponse.redirect(
      new URL(
        `/onboarding/${onboardingToken}/platforms?error=google_token_exchange`,
        APP_URL
      )
    );
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope: string;
  };

  const encryptedAccess = encrypt(tokenData.access_token);
  const encryptedRefresh = tokenData.refresh_token
    ? encrypt(tokenData.refresh_token)
    : null;
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : null;

  // Detect which Google products were authorized based on scopes granted
  const grantedScopes = tokenData.scope ?? "";
  const hasAds = grantedScopes.includes("adwords");
  const hasAnalytics = grantedScopes.includes("analytics");

  // Save connection for Google Ads
  if (hasAds) {
    await prisma.platformConnection.upsert({
      where: {
        onboardingId_platform: { onboardingId, platform: "GOOGLE_ADS" },
      },
      create: {
        onboardingId,
        platform: "GOOGLE_ADS",
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt,
      },
      update: {
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt,
        connectedAt: new Date(),
      },
    });
  }

  // Save connection for Google Analytics
  if (hasAnalytics) {
    await prisma.platformConnection.upsert({
      where: {
        onboardingId_platform: { onboardingId, platform: "GOOGLE_ANALYTICS" },
      },
      create: {
        onboardingId,
        platform: "GOOGLE_ANALYTICS",
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt,
      },
      update: {
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt,
        connectedAt: new Date(),
      },
    });
  }

  // If neither scope matched, still save as Google Ads (fallback)
  if (!hasAds && !hasAnalytics) {
    await prisma.platformConnection.upsert({
      where: {
        onboardingId_platform: { onboardingId, platform: "GOOGLE_ADS" },
      },
      create: {
        onboardingId,
        platform: "GOOGLE_ADS",
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt,
      },
      update: {
        accessToken: encryptedAccess,
        refreshToken: encryptedRefresh,
        expiresAt,
        connectedAt: new Date(),
      },
    });
  }

  return NextResponse.redirect(
    new URL(
      `/onboarding/${onboardingToken}/platforms?success=google`,
      APP_URL
    )
  );
}

async function extractOnboardingToken(state: string): Promise<string | null> {
  try {
    const payload = await verifyOAuthState(state);
    const t = payload?.["_oauthToken"];
    return typeof t === "string" ? t : null;
  } catch {
    return null;
  }
}
