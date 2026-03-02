import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth";
import { sendOnboardingCompletedEmail } from "@/lib/resend";
import { sendWhatsAppText } from "@/lib/evolution";
import { fireWebhook } from "@/lib/webhook";
import { createProjectTask } from "@/lib/projectmanagement";

// PUT /api/onboarding/[token]/step
// Body: { stepNumber: number; data: Record<string, unknown> }
// Upserts the step data and advances currentStep if needed.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await requireClientSession();
    const { token } = await params;
    const { stepNumber, data } = await request.json();

    if (typeof stepNumber !== "number") {
      return NextResponse.json({ error: "stepNumber inválido." }, { status: 400 });
    }

    const onboarding = await prisma.onboarding.findUnique({ where: { token } });

    if (!onboarding) {
      return NextResponse.json({ error: "Onboarding não encontrado." }, { status: 404 });
    }

    if (onboarding.id !== session.onboardingId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    // Upsert the step
    const step = await prisma.onboardingStep.upsert({
      where: { onboardingId_stepNumber: { onboardingId: onboarding.id, stepNumber } },
      create: {
        onboardingId: onboarding.id,
        stepNumber,
        data,
        completedAt: new Date(),
      },
      update: {
        data,
        completedAt: new Date(),
      },
    });

    // Advance currentStep pointer if this is the latest completed step
    const newCurrentStep = Math.max(onboarding.currentStep, stepNumber + 1);

    // Total steps = 4; mark completed if all done
    const TOTAL_STEPS = 4;
    const allStepsDone = newCurrentStep > TOTAL_STEPS;

    await prisma.onboarding.update({
      where: { id: onboarding.id },
      data: {
        currentStep: allStepsDone ? TOTAL_STEPS : newCurrentStep,
        status: allStepsDone ? "COMPLETED" : "IN_PROGRESS",
        completedAt: allStepsDone ? new Date() : null,
      },
    });

    // Fire completion notifications when all steps are done (non-blocking)
    if (allStepsDone) {
      const full = await prisma.onboarding.findUnique({
        where: { id: onboarding.id },
        include: {
          client: {
            include: {
              agency: {
                select: {
                  name: true,
                  webhookUrl: true,
                  whatsappPhone: true,
                  pmTool: true,
                  pmApiKey: true,
                  pmApiKey2: true,
                  pmListId: true,
                  users: { where: { role: "admin" }, select: { email: true } },
                },
              },
            },
          },
        },
      });

      if (full) {
        const adminEmails = full.client.agency.users.map((u) => u.email);

        sendOnboardingCompletedEmail({
          to: adminEmails,
          clientName: full.client.name,
          clientEmail: full.client.email,
          companyName: full.client.company,
          agencyName: full.client.agency.name,
          onboardingId: full.id,
        }).catch((err) => console.error("[completion email]", err));

        fireWebhook(full.client.agency.webhookUrl, "onboarding.completed", {
          onboardingId: full.id,
          clientName: full.client.name,
          clientEmail: full.client.email,
          company: full.client.company,
          completedAt: full.completedAt,
        }).catch((err) => console.error("[webhook onboarding.completed]", err));

        if (full.client.agency.whatsappPhone) {
          sendWhatsAppText(
            full.client.agency.whatsappPhone,
            `✅ Onboarding concluído!\n${full.client.name}${full.client.company ? ` (${full.client.company})` : ""} finalizou todas as etapas.`
          ).catch((err) => console.error("[whatsapp completion]", err));
        }

        createProjectTask({
          pmTool: full.client.agency.pmTool,
          pmApiKey: full.client.agency.pmApiKey,
          pmApiKey2: full.client.agency.pmApiKey2,
          pmListId: full.client.agency.pmListId,
          clientName: full.client.name,
          company: full.client.company,
          email: full.client.email,
          onboardingId: full.id,
        }).catch((err) => console.error("[pm task creation]", err));
      }
    }

    return NextResponse.json({ ok: true, step });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[onboarding step PUT]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
