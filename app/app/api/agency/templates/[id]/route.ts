import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

// PUT /api/agency/templates/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgencySession();
    const { id } = await params;
    const { name, description, stepDefaults } = await request.json();

    const template = await prisma.onboardingTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }
    if (template.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const updated = await prisma.onboardingTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(stepDefaults !== undefined && { stepDefaults }),
      },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[template PUT]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}

// DELETE /api/agency/templates/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgencySession();
    const { id } = await params;

    const template = await prisma.onboardingTemplate.findUnique({ where: { id } });
    if (!template) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }
    if (template.agencyId !== session.agencyId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    await prisma.onboardingTemplate.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[template DELETE]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
