/**
 * Stripe integration — Subscriptions (Checkout + Billing Portal).
 * Handles plan definitions, checkout sessions and webhook verification.
 */

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export const PLANS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER ?? "",
    name: "Starter",
    price: 97,
    clientLimit: 5,
    description: "Até 5 clientes ativos por mês",
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    name: "Pro",
    price: 197,
    clientLimit: 20,
    description: "Até 20 clientes ativos por mês",
  },
  agency: {
    priceId: process.env.STRIPE_PRICE_AGENCY ?? "",
    name: "Agency",
    price: 397,
    clientLimit: -1, // unlimited
    description: "Clientes ilimitados",
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getClientLimit(plan: string): number {
  if (plan in PLANS) return PLANS[plan as PlanKey].clientLimit;
  if (plan === "trial") return 3;
  return 0; // inactive/unknown
}

let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não configurada.");
  }
  if (!stripeClient) stripeClient = new Stripe(STRIPE_SECRET_KEY);
  return stripeClient;
}

function appUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    // Stripe rejects relative success/cancel URLs, and the failure message it
    // returns points at the URL, not at the missing env var.
    throw new Error("NEXT_PUBLIC_APP_URL não configurada.");
  }
  return url.replace(/\/$/, "");
}

/** Maps a Stripe price ID back to the plan key. */
export function planKeyFromPriceId(priceId: string | null | undefined): PlanKey | null {
  if (!priceId) return null;
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId && plan.priceId === priceId) return key as PlanKey;
  }
  return null;
}

/**
 * Translates a Stripe subscription status into the agency's `plan` column.
 * Returns null when the status decides nothing — leave the plan untouched.
 */
export function planFromStatus(status: string, planKey: PlanKey | null): string | null {
  switch (status) {
    case "active":
    case "trialing":
      return planKey ?? "starter";
    case "past_due":
      // Stripe keeps retrying the charge (dunning). Cutting access on the first
      // declined card churns customers who only need to update it.
      return planKey;
    case "canceled":
    case "unpaid":
    case "incomplete_expired":
      return "inactive";
    default:
      return null; // incomplete, paused — nothing settled yet
  }
}

/** Creates the Stripe customer for an agency. Caller persists the returned id. */
export async function createCustomer(
  email: string,
  agencyId: string,
  name?: string
): Promise<string> {
  const customer = await getStripe().customers.create({
    email,
    name,
    metadata: { agencyId },
  });
  return customer.id;
}

/**
 * Returns the hosted Checkout URL for a subscription plan.
 * `client_reference_id` carries the agency through to the webhook, so the
 * subscription is never matched by guesswork.
 */
export async function createCheckoutSession({
  planKey,
  agencyId,
  customerId,
}: {
  planKey: PlanKey;
  agencyId: string;
  customerId: string;
}): Promise<string> {
  const plan = PLANS[planKey];
  if (!plan.priceId) {
    throw new Error(
      `Price ID do plano "${planKey}" não configurado. Defina STRIPE_PRICE_${planKey.toUpperCase()}.`
    );
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    client_reference_id: agencyId,
    metadata: { agencyId, planKey },
    subscription_data: { metadata: { agencyId, planKey } },
    success_url: `${appUrl()}/admin/billing?success=1`,
    cancel_url: `${appUrl()}/admin/billing`,
    locale: "pt-BR",
  });

  if (!session.url) throw new Error("Stripe não retornou URL de checkout.");
  return session.url;
}

/**
 * Returns the hosted Billing Portal URL, where the customer cancels, swaps the
 * card and pulls invoices without us writing any of those screens.
 */
export async function createPortalSession(customerId: string): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl()}/admin/billing`,
  });
  return session.url;
}

/** Retrieves a subscription (used by the webhook to resolve status and price). */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

/**
 * Verifies the webhook signature and parses the event.
 * Throws when the signature does not check out — the caller answers 400.
 */
export function constructWebhookEvent(
  payload: string,
  signature: string | null
): Stripe.Event {
  if (!STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET não configurada.");
  if (!signature) throw new Error("Header stripe-signature ausente.");
  return getStripe().webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
}
