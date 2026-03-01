import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth";

// DELETE /api/onboarding/[token]/connections?platform=META
// Removes a platform connection for this onboarding.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await requireClientSession();
    const { token } = await params;
    const platform = new URL(request.url).searchParams.get("platform");

    if (!platform) {
      return NextResponse.json(
        { error: "platform obrigatório." },
        { status: 400 }
      );
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { token },
      select: { id: true },
    });

    if (!onboarding) {
      return NextResponse.json(
        { error: "Onboarding não encontrado." },
        { status: 404 }
      );
    }

    if (onboarding.id !== session.onboardingId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    await prisma.platformConnection.deleteMany({
      where: {
        onboardingId: onboarding.id,
        platform: platform as "META" | "GOOGLE_ADS" | "GOOGLE_ANALYTICS" | "WORDPRESS",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[connections DELETE]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
