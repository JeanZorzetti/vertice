import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

// POST /api/marketplace/templates/[id]/use
// Copies a public template into the current agency's library
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgencySession();
    const { id } = await params;

    const source = await prisma.onboardingTemplate.findUnique({ where: { id } });

    if (!source || !source.isPublic) {
      return NextResponse.json({ error: "Template não encontrado." }, { status: 404 });
    }

    // Create a copy in the agency's library
    const copy = await prisma.onboardingTemplate.create({
      data: {
        agencyId: session.agencyId,
        name: source.name,
        description: source.description,
        stepDefaults: source.stepDefaults ?? undefined,
        isPublic: false,
      },
    });

    // Increment usageCount on the source template
    await prisma.onboardingTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json(copy, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[marketplace/templates/:id/use POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
