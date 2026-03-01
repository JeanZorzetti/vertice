import { prisma } from "@/lib/prisma";
import { requireClientSession } from "@/lib/auth";
import { cookies } from "next/headers";
import PlatformsClient from "./_components/PlatformsClient";

export default async function OnboardingStep3({
  params,
  searchParams,
}: {
  params: unknown;
  searchParams: unknown;
}) {
  const { token } = await (params as Promise<{ token: string }>);
  const sp = await (searchParams as Promise<Record<string, string | undefined>>);
  const successPlatform = sp["success"] ?? null;
  const errorCode = sp["error"] ?? null;

  // Require client session (middleware already handles redirect if missing)
  await requireClientSession();

  const onboarding = await prisma.onboarding.findUnique({
    where: { token },
    include: { connections: { select: { platform: true, connectedAt: true } } },
  });

  const connections = onboarding?.connections ?? [];

  return (
    <PlatformsClient
      token={token}
      connections={connections.map((c) => ({
        platform: c.platform,
        connectedAt: c.connectedAt.toISOString(),
      }))}
      successPlatform={successPlatform}
      errorCode={errorCode}
    />
  );
}
