import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { cancelSubscription } from "@/lib/mercadopago";

// POST /api/agency/billing/cancel
export async function POST() {
  try {
    const session = await requireAgencySession();

    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
      select: { mpSubscriptionId: true },
    });

    if (!agency?.mpSubscriptionId) {
      return NextResponse.json({ error: "Nenhuma assinatura ativa." }, { status: 400 });
    }

    await cancelSubscription(agency.mpSubscriptionId);

    await prisma.agency.update({
      where: { id: session.agencyId },
      data: { mpSubscriptionStatus: "cancelled", plan: "inactive" },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[billing cancel POST]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
