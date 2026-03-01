/**
 * Generic outbound webhook dispatcher.
 * POST JSON to the agency-configured URL on key events.
 */

export type WebhookEvent =
  | "onboarding.created"
  | "onboarding.completed"
  | "onboarding.step_completed";

interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
}

export async function fireWebhook(
  url: string | null | undefined,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  if (!url) return;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.warn(`[webhook] ${event} → ${url} returned ${res.status}`);
    }
  } catch (err) {
    console.error(`[webhook] ${event} → ${url} failed:`, err);
  }
}
