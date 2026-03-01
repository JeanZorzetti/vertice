import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { createSubscription, PLANS, PlanKey } from "@/lib/mercadopago";

// POST /api/agency/billing/subscribe
// Body: { plan: "starter" | "pro" | "agency" }
// Returns { initPoint } — the Mercado Pago checkout URL.
export async function POST(request: NextRequest) {
  try {
    const session = await requireAgencySession();
    const { plan } = await request.json();

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    // Get payer email from current user
    const user = await prisma.agencyUser.findUnique({
      where: { id: session.userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const initPoint = await createSubscription({
      planKey: plan as PlanKey,
      payerEmail: user.email,
      agencyId: session.agencyId,
    });

    return NextResponse.json({ initPoint });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[billing subscribe POST]", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
