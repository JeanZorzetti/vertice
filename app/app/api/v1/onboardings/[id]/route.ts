import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiKey } from "@/lib/apikey";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

// GET /api/v1/onboardings/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const agencyId = await requireApiKey(request);
    const { id } = await params;

    const onboarding = await prisma.onboarding.findUnique({
      where: { id },
      include: {
        client: { select: { name: true, email: true, company: true, agencyId: true } },
        steps: { orderBy: { stepNumber: "asc" }, select: { stepNumber: true, completedAt: true } },
        assets: { select: { fileName: true, fileType: true, fileSize: true, uploadedAt: true } },
      },
    });

    if (!onboarding) {
      return NextResponse.json({ error: "Onboarding não encontrado." }, { status: 404 });
    }

    if (onboarding.client.agencyId !== agencyId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    return NextResponse.json({
      id: onboarding.id,
      status: onboarding.status,
      createdAt: onboarding.createdAt.toISOString(),
      completedAt: onboarding.completedAt?.toISOString() ?? null,
      link: `${APP_URL}/onboarding/${onboarding.token}`,
      client: {
        name: onboarding.client.name,
        email: onboarding.client.email,
        company: onboarding.client.company ?? null,
      },
      progress: {
        stepsCompleted: onboarding.steps.length,
        totalSteps: 4,
        steps: onboarding.steps.map((s) => ({
          stepNumber: s.stepNumber,
          completedAt: s.completedAt?.toISOString() ?? null,
        })),
      },
      assets: onboarding.assets.map((a) => ({
        fileName: a.fileName,
        fileType: a.fileType,
        fileSize: a.fileSize,
        uploadedAt: a.uploadedAt.toISOString(),
      })),
      contractSigned: !!onboarding.contractSignedAt,
      contractSignedAt: onboarding.contractSignedAt?.toISOString() ?? null,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[v1/onboardings/:id GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
