import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

// GET /api/agency/onboardings/[id]
// Returns full onboarding detail (admin view).
export async function GET(
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
        assets: true,
        connections: true,
        magicLinks: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }

    // Ensure it belongs to this agency
    if (onboarding.client.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    return NextResponse.json(onboarding);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[agency onboarding GET id]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// DELETE /api/agency/onboardings/[id]
// Soft delete or hard delete — here we hard delete (cascades via Prisma schema).
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgencySession();
    const { id } = await params;

    const onboarding = await prisma.onboarding.findUnique({
      where: { id },
      include: { client: { select: { agencyId: true } } },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }

    if (onboarding.client.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    await prisma.onboarding.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[agency onboarding DELETE]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
