import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

// GET /api/agency/templates
export async function GET() {
  try {
    const session = await requireAgencySession();

    const templates = await prisma.onboardingTemplate.findMany({
      where: { agencyId: session.agencyId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(templates);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[templates GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// POST /api/agency/templates
// Body: { name: string; description?: string; stepDefaults?: object }
export async function POST(request: NextRequest) {
  try {
    const session = await requireAgencySession();
    const { name, description, stepDefaults } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "name é obrigatório." }, { status: 400 });
    }

    const template = await prisma.onboardingTemplate.create({
      data: {
        agencyId: session.agencyId,
        name,
        description: description ?? null,
        stepDefaults: stepDefaults ?? null,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[templates POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
