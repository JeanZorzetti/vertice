import { NextRequest, NextResponse } from "next/server";
import { requireAgencySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SELECT = {
  name: true,
  slug: true,
  logoUrl: true,
  primaryColor: true,
  webhookUrl: true,
  whatsappPhone: true,
  contractTemplate: true,
  pmTool: true,
  pmApiKey: true,
  pmApiKey2: true,
  pmListId: true,
} as const;

// GET /api/agency/settings
export async function GET() {
  try {
    const session = await requireAgencySession();
    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
      select: SELECT,
    });
    if (!agency) return NextResponse.json({ error: "Agência não encontrada." }, { status: 404 });
    return NextResponse.json(agency);
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
}

// PUT /api/agency/settings
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAgencySession();
    const {
      name, logoUrl, primaryColor, webhookUrl, whatsappPhone, contractTemplate,
      pmTool, pmApiKey, pmApiKey2, pmListId,
    } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    const color = colorRegex.test(primaryColor ?? "") ? primaryColor : "#135bec";

    const agency = await prisma.agency.update({
      where: { id: session.agencyId },
      data: {
        name: String(name).trim(),
        logoUrl: logoUrl?.trim() || null,
        primaryColor: color,
        webhookUrl: webhookUrl?.trim() || null,
        whatsappPhone: whatsappPhone?.trim() || null,
        contractTemplate: contractTemplate?.trim() || null,
        pmTool: pmTool?.trim() || null,
        pmApiKey: pmApiKey?.trim() || null,
        pmApiKey2: pmApiKey2?.trim() || null,
        pmListId: pmListId?.trim() || null,
      },
      select: SELECT,
    });

    return NextResponse.json(agency);
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
