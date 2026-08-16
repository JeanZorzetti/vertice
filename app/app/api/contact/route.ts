import { NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/brevo";

// POST /api/contact
// Body: { name: string, email: string, message: string }
export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (
      !name || typeof name !== "string" ||
      !email || typeof email !== "string" || !email.includes("@") ||
      !message || typeof message !== "string"
    ) {
      return NextResponse.json({ error: "Preencha nome, e-mail e mensagem." }, { status: 400 });
    }

    await sendContactFormEmail({ name: name.trim(), email: email.trim(), message: message.trim() });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
