import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/bcrypt";
import { setSessionCookie } from "@/lib/auth";

// POST /api/agency/auth/login
// Body: { email: string; password: string }
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const normalized = String(email).trim().toLowerCase();

    const user = await prisma.agencyUser.findFirst({
      where: { email: normalized },
      include: { agency: { select: { id: true, name: true } } },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const valid = await verifyPassword(String(password), user.password);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    await setSessionCookie({
      type: "agency",
      userId: user.id,
      agencyId: user.agencyId,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[agency login]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
