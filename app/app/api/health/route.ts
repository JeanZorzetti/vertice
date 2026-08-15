import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.agency.count();
    return NextResponse.json({ status: "healthy", db: "ok" });
  } catch (err) {
    console.error("[health] database check failed:", err);
    return NextResponse.json({ status: "unhealthy", db: "error" }, { status: 500 });
  }
}
