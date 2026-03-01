import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/bcrypt";

// POST /api/agency/signup
// Body: { agencyName, slug, name, email, password }
export async function POST(request: NextRequest) {
  try {
    const { agencyName, slug, name, email, password } = await request.json();

    if (!agencyName || !slug || !name || !email || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    const normalizedSlug = String(slug)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");

    if (normalizedSlug.length < 2) {
      return NextResponse.json({ error: "Slug inválido." }, { status: 400 });
    }

    const existing = await prisma.agency.findUnique({ where: { slug: normalizedSlug } });
    if (existing) {
      return NextResponse.json({ error: "Este slug já está em uso." }, { status: 409 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const hashed = await hashPassword(String(password));

    await prisma.agency.create({
      data: {
        name: String(agencyName).trim(),
        slug: normalizedSlug,
        users: {
          create: {
            email: normalizedEmail,
            name: String(name).trim(),
            role: "admin",
            password: hashed,
          },
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[agency signup]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
