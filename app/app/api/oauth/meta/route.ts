import { NextRequest, NextResponse } from "next/server";
import { requireClientSession, signOAuthState } from "@/lib/auth";

const META_APP_ID = process.env.META_APP_ID ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Scopes needed for Meta Ads management
const SCOPES = [
  "ads_management",
  "ads_read",
  "business_management",
  "pages_read_engagement",
].join(",");

// GET /api/oauth/meta?token=<onboarding_token>
// Redirects the client browser to Meta's OAuth dialog.
export async function GET(request: NextRequest) {
  try {
    const session = await requireClientSession();
    const onboardingToken = new URL(request.url).searchParams.get("token");

    if (!onboardingToken) {
      return NextResponse.json({ error: "token obrigatório." }, { status: 400 });
    }

    if (!META_APP_ID) {
      return NextResponse.redirect(
        new URL(`/onboarding/${onboardingToken}/platforms?error=meta_not_configured`, request.url)
      );
    }

    // Encode state as tamper-proof JWT (30 min expiry)
    const state = await signOAuthState({ ...session, _oauthToken: onboardingToken });

    const params = new URLSearchParams({
      client_id: META_APP_ID,
      redirect_uri: `${APP_URL}/api/oauth/meta/callback`,
      scope: SCOPES,
      response_type: "code",
      state,
    });

    return NextResponse.redirect(
      `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[oauth meta]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
