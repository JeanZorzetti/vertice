import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";

// POST /api/agency/billing/portal
// Returns { url } — Stripe's hosted portal, where the customer cancels,
// updates the card and downloads invoices. The resulting subscription change
// comes back to us through the webhook.
export async function POST() {
  try {
    const session = await requireAgencySession();

    const agency = await prisma.agency.findUnique({
      where: { id: session.agencyId },
      select: { stripeCustomerId: true },
    });

    if (!agency?.stripeCustomerId) {
      return NextResponse.json({ error: "Nenhuma assinatura ativa." }, { status: 400 });
    }

    const url = await createPortalSession(agency.stripeCustomerId);
    return NextResponse.json({ url });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("[billing portal POST]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
