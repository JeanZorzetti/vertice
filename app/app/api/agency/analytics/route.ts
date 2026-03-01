import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

// GET /api/agency/analytics
// Returns aggregate metrics for the agency dashboard.
export async function GET() {
  try {
    const session = await requireAgencySession();

    const [totalClients, onboardingsByStatus, recentOnboardings, completedWithTime] =
      await Promise.all([
        prisma.client.count({ where: { agencyId: session.agencyId } }),

        prisma.onboarding.groupBy({
          by: ["status"],
          where: { client: { agencyId: session.agencyId } },
          _count: { _all: true },
        }),

        prisma.onboarding.findMany({
          where: { client: { agencyId: session.agencyId } },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true,
            status: true,
            createdAt: true,
            completedAt: true,
            currentStep: true,
            client: { select: { name: true, company: true } },
          },
        }),

        prisma.onboarding.findMany({
          where: {
            client: { agencyId: session.agencyId },
            status: "COMPLETED",
            completedAt: { not: null },
          },
          select: { createdAt: true, completedAt: true },
        }),
      ]);

    // Compute average completion time in hours
    let avgCompletionHours: number | null = null;
    if (completedWithTime.length > 0) {
      const totalMs = completedWithTime.reduce((sum, o) => {
        return sum + (o.completedAt!.getTime() - o.createdAt.getTime());
      }, 0);
      avgCompletionHours = Math.round(totalMs / completedWithTime.length / 1000 / 3600);
    }

    // Onboardings created per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byDay: Record<string, number> = {};
    recentOnboardings
      .filter((o) => o.createdAt >= thirtyDaysAgo)
      .forEach((o) => {
        const day = o.createdAt.toISOString().slice(0, 10);
        byDay[day] = (byDay[day] ?? 0) + 1;
      });

    const dailySeries = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const statusMap: Record<string, number> = {};
    onboardingsByStatus.forEach((g) => {
      statusMap[g.status] = g._count._all;
    });

    return NextResponse.json({
      totalClients,
      totalOnboardings: Object.values(statusMap).reduce((a, b) => a + b, 0),
      byStatus: {
        PENDING: statusMap["PENDING"] ?? 0,
        IN_PROGRESS: statusMap["IN_PROGRESS"] ?? 0,
        COMPLETED: statusMap["COMPLETED"] ?? 0,
      },
      avgCompletionHours,
      dailySeries,
      recentOnboardings,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[analytics GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
