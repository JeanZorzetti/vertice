import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

async function getOnboarding(id: string, agencyId: string) {
  const onboarding = await prisma.onboarding.findUnique({
    where: { id },
    include: { client: { select: { agencyId: true } } },
  });
  if (!onboarding || onboarding.client.agencyId !== agencyId) return null;
  return onboarding;
}

// GET /api/agency/onboardings/[id]/campaign
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgencySession();
    const { id } = await params;

    const onboarding = await getOnboarding(id, session.agencyId);
    if (!onboarding) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

    const result = await prisma.campaignResult.findUnique({ where: { onboardingId: id } });
    return NextResponse.json(result ?? null);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// PUT /api/agency/onboardings/[id]/campaign
// Body: { spend?, leads?, revenue?, notes? }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgencySession();
    const { id } = await params;

    const onboarding = await getOnboarding(id, session.agencyId);
    if (!onboarding) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

    const { spend, leads, revenue, notes } = await request.json();

    const data = {
      spend: spend !== undefined && spend !== "" ? Number(spend) : null,
      leads: leads !== undefined && leads !== "" ? parseInt(String(leads)) : null,
      revenue: revenue !== undefined && revenue !== "" ? Number(revenue) : null,
      notes: notes?.trim() || null,
    };

    const result = await prisma.campaignResult.upsert({
      where: { onboardingId: id },
      create: { onboardingId: id, ...data },
      update: data,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[campaign PUT]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
