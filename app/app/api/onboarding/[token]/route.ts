import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth";

// GET /api/onboarding/[token]
// Returns the full onboarding state for the authenticated client.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await requireClientSession();
    const { token } = await params;

    const onboarding = await prisma.onboarding.findUnique({
      where: { token },
      include: {
        steps: { orderBy: { stepNumber: "asc" } },
        assets: true,
        connections: true,
        client: {
          select: {
            name: true,
            email: true,
            company: true,
            agency: { select: { name: true, logoUrl: true, primaryColor: true } },
          },
        },
      },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "Onboarding não encontrado." }, { status: 404 });
    }

    // Ensure the session belongs to this onboarding
    if (onboarding.id !== session.onboardingId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    return NextResponse.json(onboarding);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[onboarding GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
