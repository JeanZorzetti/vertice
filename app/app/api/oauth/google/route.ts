import { NextRequest, NextResponse } from "next/server";
import { requireClientSession, signOAuthState } from "@/lib/auth";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Scopes for Google Ads + Analytics
const SCOPES = [
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
].join(" ");

// GET /api/oauth/google?token=<onboarding_token>
// Redirects the client browser to Google's OAuth dialog.
export async function GET(request: NextRequest) {
  try {
    const session = await requireClientSession();
    const onboardingToken = new URL(request.url).searchParams.get("token");

    if (!onboardingToken) {
      return NextResponse.json({ error: "token obrigatório." }, { status: 400 });
    }

    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.redirect(
        new URL(
          `/onboarding/${onboardingToken}/platforms?error=google_not_configured`,
          request.url
        )
      );
    }

    // Encode state as tamper-proof JWT (30 min expiry)
    const state = await signOAuthState({ ...session, _oauthToken: onboardingToken });

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${APP_URL}/api/oauth/google/callback`,
      scope: SCOPES,
      response_type: "code",
      access_type: "offline",
      prompt: "consent", // Force consent screen to always get refresh_token
      state,
    });

    return NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[oauth google]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
