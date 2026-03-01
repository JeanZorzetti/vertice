import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMagicLink } from "@/lib/resend";
import { randomUUID } from "crypto";

// POST /api/auth/magic-link
// Body: { email: string }
// Looks up client by email, creates a MagicLink record, sends the email.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    // Find the client and their active onboarding
    const client = await prisma.client.findFirst({
      where: { email: normalized },
      include: {
        agency: true,
        onboardings: {
          where: { status: { not: "COMPLETED" } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // Always respond 200 to avoid email enumeration
    if (!client || client.onboardings.length === 0) {
      return NextResponse.json({ ok: true });
    }

    const onboarding = client.onboardings[0];
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.magicLink.create({
      data: {
        onboardingId: onboarding.id,
        email: normalized,
        token,
        expiresAt,
      },
    });

    await sendMagicLink({
      to: normalized,
      token,
      clientName: client.name,
      agencyName: client.agency.name,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[magic-link]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
