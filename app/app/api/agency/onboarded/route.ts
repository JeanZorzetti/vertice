import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

// POST /api/agency/onboarded
// Marks the agency as having completed the guided tour.
export async function POST() {
  try {
    const session = await requireAgencySession();

    await prisma.agency.update({
      where: { id: session.agencyId },
      data: { onboardedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
