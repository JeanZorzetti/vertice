import { NextRequest, NextResponse } from "next/server";
import { OnboardingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apikey";
import { getClientLimit } from "@/lib/mercadopago";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

function formatOnboarding(o: {
  id: string;
  token: string;
  status: OnboardingStatus;
  createdAt: Date;
  completedAt: Date | null;
  steps: { stepNumber: number }[];
  client: { name: string; email: string; company: string | null };
}) {
  return {
    id: o.id,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    completedAt: o.completedAt?.toISOString() ?? null,
    link: `${APP_URL}/onboarding/${o.token}`,
    client: { name: o.client.name, email: o.client.email, company: o.client.company ?? null },
    progress: { stepsCompleted: o.steps.length, totalSteps: 4 },
  };
}

// GET /api/v1/onboardings
// Query params: status, limit (max 100, default 50), offset (default 0)
export async function GET(request: NextRequest) {
  try {
    const agencyId = await requireApiKey(request);

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") ?? undefined) as OnboardingStatus | undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0");

    const where = {
      client: { agencyId },
      ...(status ? { status } : {}),
    };

    const [onboardings, total] = await Promise.all([
      prisma.onboarding.findMany({
        where,
        include: {
          client: { select: { name: true, email: true, company: true } },
          steps: { select: { stepNumber: true } },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.onboarding.count({ where }),
    ]);

    return NextResponse.json({
      data: onboardings.map(formatOnboarding),
      total,
      limit,
      offset,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[v1/onboardings GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// POST /api/v1/onboardings
// Body: { clientName, email, company?, phone? }
export async function POST(request: NextRequest) {
  try {
    const agencyId = await requireApiKey(request);
    const { clientName, email, company, phone } = await request.json();

    if (!clientName?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "clientName e email são obrigatórios." }, { status: 400 });
    }

    // Plan limit enforcement
    const agency = await prisma.agency.findUnique({
      where: { id: agencyId },
      select: { plan: true, trialEndsAt: true, createdAt: true },
    });

    const plan = agency?.plan ?? "trial";
    const clientLimit = getClientLimit(plan);

    if (plan === "trial") {
      const trialEndsAt = agency?.trialEndsAt ?? new Date(agency!.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
      if (new Date() > trialEndsAt) {
        return NextResponse.json({ error: "Trial expirado. Assine um plano.", code: "TRIAL_EXPIRED" }, { status: 403 });
      }
    }

    if (plan === "inactive") {
      return NextResponse.json({ error: "Conta inativa. Assine um plano.", code: "INACTIVE" }, { status: 403 });
    }

    if (clientLimit !== -1) {
      const activeCount = await prisma.onboarding.count({
        where: { client: { agencyId }, status: { not: "COMPLETED" } },
      });
      if (activeCount >= clientLimit) {
        return NextResponse.json({
          error: `Limite de ${clientLimit} clientes ativos atingido.`,
          code: "LIMIT_REACHED",
        }, { status: 403 });
      }
    }

    const normalized = email.trim().toLowerCase();

    // Upsert client
    const client = await prisma.client.upsert({
      where: { agencyId_email: { agencyId, email: normalized } },
      update: { name: clientName.trim(), company: company?.trim() || null, phone: phone?.trim() || null },
      create: { agencyId, name: clientName.trim(), email: normalized, company: company?.trim() || null, phone: phone?.trim() || null },
    });

    // Create onboarding
    const onboarding = await prisma.onboarding.create({
      data: { clientId: client.id, currentStep: 1 },
      include: {
        client: { select: { name: true, email: true, company: true } },
        steps: { select: { stepNumber: true } },
      },
    });

    return NextResponse.json(formatOnboarding(onboarding), { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[v1/onboardings POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
