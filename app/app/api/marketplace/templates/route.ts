import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

// GET /api/marketplace/templates
// Returns public templates from all agencies (excluding the current agency's own)
export async function GET() {
  try {
    const session = await requireAgencySession();

    const templates = await prisma.onboardingTemplate.findMany({
      where: {
        isPublic: true,
        agencyId: { not: session.agencyId },
      },
      orderBy: [{ usageCount: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        description: true,
        stepDefaults: true,
        usageCount: true,
        createdAt: true,
        agency: { select: { name: true } },
      },
    });

    return NextResponse.json(templates);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[marketplace/templates GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
