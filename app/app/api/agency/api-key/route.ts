import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { generateApiKey } from "@/lib/apikey";

// GET /api/agency/api-key — returns whether a key is already configured
export async function GET() {
  try {
    const session = await requireAgencySession();
    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
      select: { apiKeyHash: true },
    });
    return NextResponse.json({ hasKey: !!agency?.apiKeyHash });
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
}

// POST /api/agency/api-key — generates (or regenerates) the API key
// Returns { key } once — the raw key is NOT stored and cannot be recovered
export async function POST() {
  try {
    const session = await requireAgencySession();
    const { raw, hash } = generateApiKey();

    await prisma.agency.update({
      where: { id: session.agencyId },
      data: { apiKeyHash: hash },
    });

    return NextResponse.json({ key: raw });
  } catch {
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
