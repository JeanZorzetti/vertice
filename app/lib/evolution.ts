/**
 * Evolution API — WhatsApp notifications
 * Docs: https://doc.evolution-api.com/
 */

const API_URL = (process.env.EVOLUTION_API_URL ?? "").replace(/\/$/, "");
const API_KEY = process.env.EVOLUTION_API_KEY ?? "";
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? "";

function normalizePhone(phone: string): string {
  // Remove everything except digits
  const digits = phone.replace(/\D/g, "");
  // Add Brazil country code if not present
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

export async function sendWhatsAppText(
  phone: string,
  text: string
): Promise<void> {
  if (!API_URL || !API_KEY || !INSTANCE) {
    console.warn("[evolution] EVOLUTION_API_URL/KEY/INSTANCE not set — skipping");
    return;
  }

  const number = normalizePhone(phone);

  const res = await fetch(`${API_URL}/message/sendText/${INSTANCE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
    },
    body: JSON.stringify({
      number,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[evolution] sendText failed ${res.status}: ${body}`);
  }
}
