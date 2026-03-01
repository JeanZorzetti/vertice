import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { analyzeBriefing } from "@/lib/claude";

// POST /api/agency/onboardings/[id]/analyze
// Runs Claude AI analysis on the onboarding briefing data and saves the result.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgencySession();
    const { id } = await params;

    const onboarding = await prisma.onboarding.findUnique({
      where: { id },
      include: {
        client: true,
        steps: { orderBy: { stepNumber: "asc" } },
        assets: { select: { fileName: true, fileType: true } },
        connections: { select: { platform: true } },
      },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }

    if (onboarding.client.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
      select: { name: true },
    });

    const analysis = await analyzeBriefing({
      clientName: onboarding.client.name,
      company: onboarding.client.company,
      agencyName: agency?.name ?? "Agência",
      steps: onboarding.steps.map((s) => ({
        stepNumber: s.stepNumber,
        data: s.data as Record<string, unknown> | null,
        completedAt: s.completedAt?.toISOString() ?? null,
      })),
      assets: onboarding.assets,
      connections: onboarding.connections,
    });

    const updated = await prisma.onboarding.update({
      where: { id },
      data: { aiAnalysis: analysis },
      select: { id: true, aiAnalysis: true },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[analyze POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
