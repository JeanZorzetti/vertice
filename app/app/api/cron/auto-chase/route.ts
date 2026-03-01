import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendChaseEmail } from "@/lib/resend";
import { sendWhatsAppText } from "@/lib/evolution";
import { randomUUID } from "crypto";

const CRON_SECRET = process.env.CRON_SECRET ?? "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "";

const STALE_HOURS = 48;
const MAGIC_LINK_HOURS = 24;

// GET /api/cron/auto-chase
// Called by GitHub Actions on a schedule.
// Protected by Authorization: Bearer CRON_SECRET header.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? "";
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);

  // Find onboardings that:
  // 1. Are IN_PROGRESS
  // 2. Haven't been updated in 48h
  // 3. Haven't been chased in the last 48h (or never chased)
  const stalled = await prisma.onboarding.findMany({
    where: {
      status: "IN_PROGRESS",
      updatedAt: { lt: cutoff },
      OR: [
        { lastChasedAt: null },
        { lastChasedAt: { lt: cutoff } },
      ],
    },
    include: {
      client: {
        include: {
          agency: {
            select: { name: true, slug: true, webhookUrl: true, whatsappPhone: true },
          },
        },
      },
    },
  });

  if (stalled.length === 0) {
    return NextResponse.json({ chased: 0, message: "No stalled onboardings." });
  }

  let chased = 0;

  for (const onboarding of stalled) {
    const { client } = onboarding;
    const { agency } = client;

    try {
      // Create a new short-lived magic link for the reminder
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + MAGIC_LINK_HOURS * 60 * 60 * 1000);

      await prisma.magicLink.create({
        data: {
          onboardingId: onboarding.id,
          email: client.email,
          token,
          expiresAt,
        },
      });

      const baseUrl =
        agency.slug && BASE_DOMAIN
          ? `https://${agency.slug}.${BASE_DOMAIN}`
          : APP_URL;
      const magicUrl = `${baseUrl}/api/auth/verify?token=${token}`;

      // Send reminder email
      await sendChaseEmail({
        to: client.email,
        clientName: client.name,
        agencyName: agency.name,
        magicUrl,
      });

      // WhatsApp for client (if they have a phone number)
      if (client.phone) {
        sendWhatsAppText(
          client.phone,
          `Olá ${client.name}! 👋 A equipe da ${agency.name} está aguardando as suas informações de onboarding. Acesse o link para continuar: ${magicUrl}`
        ).catch((err) => console.error("[auto-chase whatsapp client]", err));
      }

      // WhatsApp for agency (if configured)
      if (agency.whatsappPhone) {
        sendWhatsAppText(
          agency.whatsappPhone,
          `⏰ Lembrete Vértice: ${client.name} (${client.email}) ainda não concluiu o onboarding. Último acesso há mais de ${STALE_HOURS}h.`
        ).catch((err) => console.error("[auto-chase whatsapp agency]", err));
      }

      // Mark as chased
      await prisma.onboarding.update({
        where: { id: onboarding.id },
        data: { lastChasedAt: new Date() },
      });

      chased++;
    } catch (err) {
      console.error(`[auto-chase] failed for onboarding ${onboarding.id}:`, err);
    }
  }

  return NextResponse.json({ chased, total: stalled.length });
}
