import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth";

// POST /api/onboarding/[token]/sign-contract
// Body: { signerName: string }
// Records the client's electronic signature (name + timestamp + IP).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await requireClientSession();
    const { token } = await params;
    const { signerName } = await request.json();

    if (!signerName?.trim()) {
      return NextResponse.json({ error: "Nome completo é obrigatório." }, { status: 400 });
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { token },
      select: { id: true, contractSignedAt: true },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "Onboarding não encontrado." }, { status: 404 });
    }

    if (onboarding.id !== session.onboardingId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    if (onboarding.contractSignedAt) {
      return NextResponse.json({ ok: true }); // already signed, idempotent
    }

    // Capture IP from Vercel/proxy headers
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    await prisma.onboarding.update({
      where: { id: onboarding.id },
      data: {
        contractSignedAt: new Date(),
        contractSignerName: String(signerName).trim(),
        contractSignerIp: ip,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[sign-contract POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
