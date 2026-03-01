import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { randomUUID } from "crypto";
import { sendWhatsAppText } from "@/lib/evolution";
import { fireWebhook } from "@/lib/webhook";
import { createOnboardingFolder } from "@/lib/google-drive";
import { getClientLimit } from "@/lib/mercadopago";

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

    // Enforce client limit based on plan (fetch all agency fields needed below)
    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
      select: { plan: true, trialEndsAt: true, createdAt: true, name: true, webhookUrl: true, whatsappPhone: true },
    });

    const plan = agency?.plan ?? "trial";
    const clientLimit = getClientLimit(plan);

    // Check trial expiry
    if (plan === "trial") {
      const trialEndsAt = agency?.trialEndsAt ?? new Date(agency!.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);
      if (new Date() > trialEndsAt) {
        return NextResponse.json({ error: "Seu trial expirou. Assine um plano para continuar.", code: "TRIAL_EXPIRED" }, { status: 403 });
      }
    }

    if (plan === "inactive") {
      return NextResponse.json({ error: "Conta inativa. Assine um plano para continuar.", code: "INACTIVE" }, { status: 403 });
    }

    if (clientLimit !== -1) {
      const activeCount = await prisma.onboarding.count({
        where: {
          client: { agencyId: session.agencyId },
          status: { not: "COMPLETED" },
        },
      });
      if (activeCount >= clientLimit) {
        return NextResponse.json({
          error: `Limite de ${clientLimit} clientes ativos atingido. Faça upgrade para continuar.`,
          code: "LIMIT_REACHED",
        }, { status: 403 });
      }
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

    // Create Google Drive folder (non-blocking — don't fail onboarding if Drive is down)
    let driveFolderId: string | null = null;
    try {
      driveFolderId = await createOnboardingFolder(clientName, company ?? null);
    } catch (err) {
      console.error("[google-drive] folder creation failed:", err);
    }

    // Create onboarding
    const onboarding = await prisma.onboarding.create({
      data: {
        clientId: client.id,
        token: randomUUID(),
        status: "PENDING",
        currentStep: 1,
        driveFolderId,
      },
      include: {
        client: { select: { name: true, email: true, company: true } },
      },
    });

    // Fire notifications (non-blocking) — reuse agency already fetched above
    if (agency) {
      fireWebhook(agency.webhookUrl, "onboarding.created", {
        onboardingId: onboarding.id,
        clientName: client.name,
        clientEmail: normalized,
        company: client.company,
      }).catch((err) => console.error("[webhook onboarding.created]", err));

      if (agency.whatsappPhone) {
        sendWhatsAppText(
          agency.whatsappPhone,
          `🆕 Novo onboarding criado!\nCliente: ${client.name} (${normalized})${client.company ? `\nEmpresa: ${client.company}` : ""}`
        ).catch((err) => console.error("[whatsapp onboarding.created]", err));
      }
    }

    return NextResponse.json(onboarding, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[agency onboardings POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
