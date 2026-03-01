import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature, PLANS, PlanKey } from "@/lib/mercadopago";

// Map from MP preapproval_plan_id → plan key
function planKeyFromPlanId(planId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.id === planId) return key as PlanKey;
  }
  return null;
}

function clientLimitFromPlan(planKey: PlanKey): number {
  return PLANS[planKey].clientLimit;
}

// POST /api/webhooks/mercadopago
// Receives subscription status changes from Mercado Pago.
export async function POST(request: NextRequest) {
  const body = await request.text();

  const sig = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  const ts = new URL(request.url).searchParams.get("ts");

  if (!verifyWebhookSignature(sig, requestId, body, ts)) {
    console.warn("[mp-webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = payload.type as string;
  const dataId = (payload.data as Record<string, unknown>)?.id as string;

  if (!dataId) {
    return NextResponse.json({ ok: true }); // ack unknown events
  }

  // Handle subscription events
  if (type === "subscription_preapproval") {
    try {
      const mpToken = process.env.MP_ACCESS_TOKEN ?? "";
      const res = await fetch(`https://api.mercadopago.com/preapproval/${dataId}`, {
        headers: { Authorization: `Bearer ${mpToken}` },
      });
      const subscription = await res.json();

      let agencyId = subscription.external_reference as string | undefined;
      const status = subscription.status as string; // authorized | paused | cancelled | pending
      const planId = subscription.preapproval_plan_id as string;

      // If no external_reference (plan init_point flow), look up agency by payer email
      if (!agencyId) {
        const payerEmail = (subscription.payer as Record<string, unknown> | undefined)?.email as string | undefined;
        if (payerEmail) {
          const user = await prisma.agencyUser.findFirst({
            where: { email: payerEmail },
            select: { agencyId: true },
          });
          agencyId = user?.agencyId;
        }
      }

      if (!agencyId) {
        console.warn("[mp-webhook] could not identify agency for subscription", dataId);
        return NextResponse.json({ ok: true });
      }

      const planKey = planKeyFromPlanId(planId);
      const plan = planKey ?? (status === "authorized" ? "starter" : "trial");
      const isActive = status === "authorized";

      await prisma.agency.update({
        where: { id: agencyId },
        data: {
          mpSubscriptionId: dataId,
          mpSubscriptionStatus: status,
          plan: isActive ? plan : (status === "cancelled" ? "inactive" : "trial"),
        },
      });

      console.log(`[mp-webhook] agency ${agencyId} subscription ${dataId} → ${status} (plan: ${plan})`);
    } catch (err) {
      console.error("[mp-webhook] error processing subscription event:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
