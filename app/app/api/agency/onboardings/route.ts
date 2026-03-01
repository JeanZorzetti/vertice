import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { randomUUID } from "crypto";

// GET /api/agency/onboardings
// Lists all onboardings for the agency with client info and progress.
export async function GET() {
  try {
    const session = await requireAgencySession();

    const onboardings = await prisma.onboarding.findMany({
      where: { client: { agencyId: session.agencyId } },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, email: true, company: true } },
        steps: { select: { stepNumber: true, completedAt: true } },
        assets: { select: { id: true } },
      },
    });

    return NextResponse.json(onboardings);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[agency onboardings GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// POST /api/agency/onboardings
// Body: { clientName: string; email: string; company?: string; phone?: string }
// Creates (or finds) a client and creates a new Onboarding with a unique token.
export async function POST(request: NextRequest) {
  try {
    const session = await requireAgencySession();
    const { clientName, email, company, phone } = await request.json();

    if (!clientName || !email) {
      return NextResponse.json({ error: "clientName e email são obrigatórios." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Upsert client
    const client = await prisma.client.upsert({
      where: { agencyId_email: { agencyId: session.agencyId, email: normalized } },
      create: {
        agencyId: session.agencyId,
        name: clientName,
        email: normalized,
        company: company ?? null,
        phone: phone ?? null,
      },
      update: {
        name: clientName,
        company: company ?? undefined,
        phone: phone ?? undefined,
      },
    });

    // Create onboarding
    const onboarding = await prisma.onboarding.create({
      data: {
        clientId: client.id,
        token: randomUUID(),
        status: "PENDING",
        currentStep: 1,
      },
      include: {
        client: { select: { name: true, email: true, company: true } },
      },
    });

    return NextResponse.json(onboarding, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[agency onboardings POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
