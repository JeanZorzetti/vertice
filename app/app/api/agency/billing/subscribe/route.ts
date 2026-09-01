import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { createCheckoutSession, createCustomer, PLANS, PlanKey } from "@/lib/stripe";

// POST /api/agency/billing/subscribe
// Body: { plan: "starter" | "pro" | "agency" }
// Returns { url } — the Stripe Checkout URL.
export async function POST(request: NextRequest) {
  try {
    const session = await requireAgencySession();
    const { plan } = await request.json();

    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
    }

    const [agency, user] = await Promise.all([
      prisma.agency.findUnique({
        where: { id: session.agencyId },
        select: { name: true, stripeCustomerId: true },
      }),
      prisma.agencyUser.findUnique({
        where: { id: session.userId },
        select: { email: true },
      }),
    ]);

    if (!agency) {
      return NextResponse.json({ error: "Agência não encontrada." }, { status: 404 });
    }
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // One Stripe customer per agency, reused on every upgrade — otherwise each
    // plan change would orphan a customer and split the billing history.
    let customerId = agency.stripeCustomerId;
    if (!customerId) {
      customerId = await createCustomer(user.email, session.agencyId, agency.name);
      await prisma.agency.update({
        where: { id: session.agencyId },
        data: { stripeCustomerId: customerId },
      });
    }

    const url = await createCheckoutSession({
      planKey: plan as PlanKey,
      agencyId: session.agencyId,
      customerId,
    });

    return NextResponse.json({ url });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[billing subscribe POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
