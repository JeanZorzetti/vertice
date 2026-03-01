import { NextRequest, NextResponse } from "next/server";
import { requireAgencySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/agency/settings
export async function GET() {
  try {
    const session = await requireAgencySession();
    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
      select: { name: true, slug: true, logoUrl: true, primaryColor: true },
    });
    if (!agency) return NextResponse.json({ error: "Agência não encontrada." }, { status: 404 });
    return NextResponse.json(agency);
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
}

// PUT /api/agency/settings
// Body: { name, logoUrl, primaryColor }
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAgencySession();
    const { name, logoUrl, primaryColor } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    // Basic hex color validation
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    const color = colorRegex.test(primaryColor ?? "") ? primaryColor : "#135bec";

    const agency = await prisma.agency.update({
      where: { id: session.agencyId },
      data: {
        name: String(name).trim(),
        logoUrl: logoUrl?.trim() || null,
        primaryColor: color,
      },
      select: { name: true, slug: true, logoUrl: true, primaryColor: true },
    });

    return NextResponse.json(agency);
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
