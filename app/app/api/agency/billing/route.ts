import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { PLANS, getClientLimit } from "@/lib/mercadopago";

// GET /api/agency/billing
// Returns current plan info for the agency.
export async function GET() {
  try {
    const session = await requireAgencySession();

    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
      select: {
        plan: true,
        trialEndsAt: true,
        mpSubscriptionId: true,
        mpSubscriptionStatus: true,
        createdAt: true,
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agência não encontrada." }, { status: 404 });
    }

    const clientLimit = getClientLimit(agency.plan);

    // Compute trial end date: 14 days from creation if not explicitly set
    const trialEndsAt =
      agency.trialEndsAt ??
      new Date(agency.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000);

    const trialDaysLeft = agency.plan === "trial"
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))
      : null;

    return NextResponse.json({
      plan: agency.plan,
      trialEndsAt: agency.plan === "trial" ? trialEndsAt.toISOString() : null,
      trialDaysLeft,
      clientLimit,
      mpSubscriptionId: agency.mpSubscriptionId,
      mpSubscriptionStatus: agency.mpSubscriptionStatus,
      plans: Object.entries(PLANS).map(([key, p]) => ({
        key,
        name: p.name,
        price: p.price,
        clientLimit: p.clientLimit,
        description: p.description,
        current: agency.plan === key,
      })),
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[billing GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
