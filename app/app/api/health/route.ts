import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const dbUrlMasked = dbUrl
    ? dbUrl.replace(/:([^:@]+)@/, ":***@")
    : "NOT SET";

  try {
    const count = await prisma.agency.count();
    return NextResponse.json({ db: "ok", agencies: count, dbUrl: dbUrlMasked });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { db: "error", message, dbUrl: dbUrlMasked },
      { status: 500 }
    );
  }
}
