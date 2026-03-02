import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

// GET /api/agency/analytics
// Returns aggregate metrics for the agency dashboard.
export async function GET() {
  try {
    const session = await requireAgencySession();

    const agencyId = session.agencyId;

    const [
      totalClients,
      onboardingsByStatus,
      recentOnboardings,
      completedWithTime,
      stepCounts,
      totalOnboardings,
      onboardingsWithAssets,
      onboardingsWithConnections,
      signedContracts,
      agency,
      campaignResults,
    ] = await Promise.all([
      prisma.client.count({ where: { agencyId } }),

      prisma.onboarding.groupBy({
        by: ["status"],
        where: { client: { agencyId } },
        _count: { _all: true },
      }),

      prisma.onboarding.findMany({
        where: { client: { agencyId } },
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
          client: { agencyId },
          status: "COMPLETED",
          completedAt: { not: null },
        },
        select: { createdAt: true, completedAt: true },
      }),

      // Count completed steps by stepNumber across all onboardings of this agency
      prisma.onboardingStep.groupBy({
        by: ["stepNumber"],
        where: {
          onboarding: { client: { agencyId } },
          completedAt: { not: null },
        },
        _count: { _all: true },
      }),

      prisma.onboarding.count({ where: { client: { agencyId } } }),

      // Count distinct onboardings that have at least one asset upload
      prisma.assetUpload.groupBy({
        by: ["onboardingId"],
        where: { onboarding: { client: { agencyId } } },
      }),

      // Count distinct onboardings that have at least one platform connection
      prisma.platformConnection.groupBy({
        by: ["onboardingId"],
        where: { onboarding: { client: { agencyId } } },
      }),

      // Count signed contracts
      prisma.onboarding.count({
        where: {
          client: { agencyId },
          contractSignedAt: { not: null },
        },
      }),

      // Agency info (for contract template status)
      prisma.agency.findUnique({
        where: { id: agencyId },
        select: { contractTemplate: true },
      }),

      // Campaign results aggregate
      prisma.campaignResult.findMany({
        where: { onboarding: { client: { agencyId } } },
        select: { spend: true, leads: true, revenue: true },
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

    // Build step funnel: steps 1–4
    const stepFunnel: Record<number, number> = {};
    stepCounts.forEach((s) => {
      stepFunnel[s.stepNumber] = s._count._all;
    });

    const funnel = [1, 2, 3, 4].map((step) => ({
      step,
      count: stepFunnel[step] ?? 0,
      rate: totalOnboardings > 0 ? Math.round(((stepFunnel[step] ?? 0) / totalOnboardings) * 100) : 0,
    }));

    const assetRate = totalOnboardings > 0
      ? Math.round((onboardingsWithAssets.length / totalOnboardings) * 100) : 0;

    const connectionRate = totalOnboardings > 0
      ? Math.round((onboardingsWithConnections.length / totalOnboardings) * 100) : 0;

    const contractRate = agency?.contractTemplate && totalOnboardings > 0
      ? Math.round((signedContracts / totalOnboardings) * 100)
      : null;

    // Campaign aggregate
    const campaignAggregate = campaignResults.length > 0 ? {
      count: campaignResults.length,
      totalSpend: campaignResults.reduce((s, r) => s + (r.spend ?? 0), 0),
      totalRevenue: campaignResults.reduce((s, r) => s + (r.revenue ?? 0), 0),
      totalLeads: campaignResults.reduce((s, r) => s + (r.leads ?? 0), 0),
      avgRoas: (() => {
        const withBoth = campaignResults.filter((r) => r.spend && r.revenue && r.spend > 0);
        if (!withBoth.length) return null;
        const sum = withBoth.reduce((s, r) => s + r.revenue! / r.spend!, 0);
        return Math.round((sum / withBoth.length) * 100) / 100;
      })(),
    } : null;

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
      performance: {
        funnel,
        assetRate,
        connectionRate,
        contractRate,
        signedContracts,
      },
      campaignAggregate,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[analytics GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
