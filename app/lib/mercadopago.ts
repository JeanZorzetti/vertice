/**
 * Mercado Pago integration — Subscriptions (Preapproval)
 * Handles plan management and subscription creation for billing.
 */

import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from "mercadopago";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN ?? "";
const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? "";

export const PLANS = {
  starter: {
    id: process.env.MP_PLAN_STARTER_ID ?? "",
    name: "Starter",
    price: 97,
    clientLimit: 5,
    description: "Até 5 clientes ativos por mês",
  },
  pro: {
    id: process.env.MP_PLAN_PRO_ID ?? "",
    name: "Pro",
    price: 197,
    clientLimit: 20,
    description: "Até 20 clientes ativos por mês",
  },
  agency: {
    id: process.env.MP_PLAN_AGENCY_ID ?? "",
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

function getMPClient() {
  return new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
}

/**
 * Creates the 3 subscription plans in Mercado Pago.
 * Run once to initialize — stores IDs in env vars.
 */
export async function createPlans() {
  const client = getMPClient();
  const planApi = new PreApprovalPlan(client);

  const results: Record<string, string> = {};

  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.id) continue; // already created

    const res = await planApi.create({
      body: {
        reason: `Vértice ${plan.name}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: plan.price,
          currency_id: "BRL",
        },
        payment_methods_allowed: {
          payment_types: [{ id: "credit_card" }],
        },
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/billing`,
        status: "active",
      },
    });

    results[key] = res.id ?? "";
  }

  return results;
}

/**
 * Returns the hosted checkout URL for a subscription plan.
 * Fetches the plan's init_point from MP (user enters card details on MP's page).
 */
export async function createSubscription({
  planKey,
}: {
  planKey: PlanKey;
  payerEmail?: string;
  agencyId?: string;
}): Promise<string> {
  const plan = PLANS[planKey];
  if (!plan.id) {
    throw new Error(`Plan ID for "${planKey}" not configured. Set MP_PLAN_${planKey.toUpperCase()}_ID env var.`);
  }

  // Fetch the plan from MP to get its hosted checkout init_point
  const res = await fetch(`https://api.mercadopago.com/preapproval_plan/${plan.id}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
  });

  if (!res.ok) {
    const err: unknown = await res.json();
    throw err;
  }

  const planData = await res.json() as { init_point?: string };

  if (!planData.init_point) {
    throw new Error("No init_point returned from Mercado Pago plan");
  }

  return planData.init_point;
}

/**
 * Cancels an existing subscription.
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const client = getMPClient();
  const preApproval = new PreApproval(client);
  await preApproval.update({
    id: subscriptionId,
    body: { status: "cancelled" },
  });
}

/**
 * Verifies the Mercado Pago webhook signature.
 * Returns true if valid.
 */
export function verifyWebhookSignature(
  signatureHeader: string | null,
  requestId: string | null,
  body: string,
  ts: string | null
): boolean {
  if (!MP_WEBHOOK_SECRET || !signatureHeader) return !MP_WEBHOOK_SECRET;

  // MP sends: ts=<timestamp>,v1=<hmac>
  const parts: Record<string, string> = {};
  signatureHeader.split(",").forEach((part) => {
    const [k, v] = part.split("=");
    if (k && v) parts[k] = v;
  });

  const { v1, ts: sigTs } = parts;
  const timestamp = ts ?? sigTs;
  if (!v1 || !timestamp) return false;

  const crypto = require("crypto");
  const manifest = `id:${requestId};request-id:${requestId};ts:${timestamp};`;
  const expected = crypto
    .createHmac("sha256", MP_WEBHOOK_SECRET)
    .update(manifest)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));
}
