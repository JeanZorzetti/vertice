import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOAuthState } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";

const META_APP_ID = process.env.META_APP_ID ?? "";
const META_APP_SECRET = process.env.META_APP_SECRET ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// GET /api/oauth/meta/callback?code=...&state=...
// Meta redirects here after user grants permissions.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  // Meta may return ?error=access_denied if user cancelled
  if (errorParam) {
    const redirectTo = state ? await extractOnboardingToken(state) : null;
    const base = redirectTo
      ? `/onboarding/${redirectTo}/platforms`
      : "/onboarding";
    return NextResponse.redirect(
      new URL(`${base}?error=meta_cancelled`, APP_URL)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding?error=meta_invalid_callback", APP_URL)
    );
  }

  // Verify the signed state JWT and extract session + onboarding token
  let onboardingToken: string;
  let onboardingId: string;

  try {
    const payload = await verifyOAuthState(state);
    const rawToken = payload?.["_oauthToken"];
    if (typeof rawToken !== "string" || !rawToken) {
      throw new Error("missing _oauthToken in state");
    }
    onboardingToken = rawToken;

    // Resolve onboarding by token to get the DB id
    const onboarding = await prisma.onboarding.findUnique({
      where: { token: onboardingToken },
      select: { id: true },
    });
    if (!onboarding) throw new Error("onboarding not found");
    onboardingId = onboarding.id;
  } catch {
    return NextResponse.redirect(
      new URL("/onboarding?error=meta_invalid_state", APP_URL)
    );
  }

  // Exchange the code for an access token
  const tokenParams = new URLSearchParams({
    client_id: META_APP_ID,
    client_secret: META_APP_SECRET,
    redirect_uri: `${APP_URL}/api/oauth/meta/callback`,
    code,
  });

  const tokenRes = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?${tokenParams.toString()}`
  );

  if (!tokenRes.ok) {
    console.error("[meta callback] token exchange failed", await tokenRes.text());
    return NextResponse.redirect(
      new URL(
        `/onboarding/${onboardingToken}/platforms?error=meta_token_exchange`,
        APP_URL
      )
    );
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    token_type: string;
    expires_in?: number;
  };

  // Optionally exchange for a long-lived token (60 days)
  const llParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: META_APP_ID,
    client_secret: META_APP_SECRET,
    fb_exchange_token: tokenData.access_token,
  });

  let finalToken = tokenData.access_token;
  let expiresAt: Date | null = null;

  const llRes = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?${llParams.toString()}`
  );

  if (llRes.ok) {
    const llData = (await llRes.json()) as {
      access_token: string;
      expires_in?: number;
    };
    finalToken = llData.access_token;
    if (llData.expires_in) {
      expiresAt = new Date(Date.now() + llData.expires_in * 1000);
    }
  }

  // Encrypt and persist the token
  const encryptedToken = encrypt(finalToken);

  await prisma.platformConnection.upsert({
    where: { onboardingId_platform: { onboardingId, platform: "META" } },
    create: {
      onboardingId,
      platform: "META",
      accessToken: encryptedToken,
      expiresAt,
    },
    update: {
      accessToken: encryptedToken,
      expiresAt,
      connectedAt: new Date(),
    },
  });

  return NextResponse.redirect(
    new URL(
      `/onboarding/${onboardingToken}/platforms?success=meta`,
      APP_URL
    )
  );
}

// Helper: try to extract onboarding token from state JWT (best-effort, no throw)
async function extractOnboardingToken(state: string): Promise<string | null> {
  try {
    const payload = await verifyOAuthState(state);
    const t = payload?.["_oauthToken"];
    return typeof t === "string" ? t : null;
  } catch {
    return null;
  }
}
