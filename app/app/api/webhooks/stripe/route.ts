import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import {
  constructWebhookEvent,
  getSubscription,
  planKeyFromPriceId,
  planFromStatus,
} from "@/lib/stripe";

export const runtime = "nodejs";

/** Resolves the agency behind a subscription, in order of certainty. */
async function findAgencyId(sub: Stripe.Subscription): Promise<string | null> {
  const fromMetadata = sub.metadata?.agencyId;
  if (fromMetadata) {
    const agency = await prisma.agency.findUnique({
      where: { id: fromMetadata },
      select: { id: true },
    });
    if (agency) return agency.id;
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  const agency = await prisma.agency.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId: sub.id },
        ...(customerId ? [{ stripeCustomerId: customerId }] : []),
      ],
    },
    select: { id: true },
  });

  return agency?.id ?? null;
}

/** Writes the subscription state onto the agency. */
async function applySubscription(agencyId: string, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id;
  const planKey = planKeyFromPriceId(priceId);
  const plan = planFromStatus(sub.status, planKey);
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

  await prisma.agency.update({
    where: { id: agencyId },
    data: {
      stripeSubscriptionId: sub.id,
      stripeSubscriptionStatus: sub.status,
      ...(customerId ? { stripeCustomerId: customerId } : {}),
      ...(plan ? { plan } : {}),
    },
  });

  console.log(
    `[stripe-webhook] agency ${agencyId} subscription ${sub.id} → ${sub.status}` +
      (plan ? ` (plan: ${plan})` : " (plan unchanged)")
  );
}

// POST /api/webhooks/stripe
// Receives subscription lifecycle events from Stripe.
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : "assinatura inválida";
    console.warn("[stripe-webhook] signature check failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const agencyId = session.client_reference_id ?? session.metadata?.agencyId;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!agencyId || !subscriptionId) {
          console.warn("[stripe-webhook] checkout without agency or subscription", session.id);
          break;
        }

        const sub = await getSubscription(subscriptionId);
        await applySubscription(agencyId, sub);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const agencyId = await findAgencyId(sub);

        if (!agencyId) {
          console.warn("[stripe-webhook] could not identify agency for subscription", sub.id);
          break;
        }

        await applySubscription(agencyId, sub);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(
          `[stripe-webhook] payment failed for customer ${String(invoice.customer)} — invoice ${invoice.id}`
        );
        break;
      }

      default:
        break; // ack everything else
    }
  } catch (err) {
    // Answering 500 makes Stripe retry, which is what we want for a transient
    // database error — but a permanent bug would then retry for days.
    console.error(`[stripe-webhook] error handling ${event.type}:`, err);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
