import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "./_components/Sidebar";

export default async function OnboardingTokenLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: unknown;
}) {
  const { token } = await (params as Promise<{ token: string }>);
  const session = await getSession();

  if (!session || session.type !== "client") {
    redirect("/login");
  }

  const onboarding = await prisma.onboarding.findUnique({
    where: { token },
    include: {
      client: {
        include: {
          agency: {
            select: { name: true, logoUrl: true, primaryColor: true, contractTemplate: true },
          },
        },
      },
      steps: { select: { stepNumber: true } },
    },
  });

  if (!onboarding || onboarding.id !== session.onboardingId) {
    redirect("/login");
  }

  const { agency } = onboarding.client;
  const completedSteps = onboarding.steps.map((s) => s.stepNumber);
  const hasContract = !!agency.contractTemplate;
  const contractSigned = !!onboarding.contractSignedAt;

  // Redirect to contract page if agency requires a signature and client hasn't signed yet
  if (hasContract && !contractSigned) {
    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") ?? headersList.get("x-pathname") ?? "";
    if (!pathname.endsWith("/contract")) {
      redirect(`/onboarding/${token}/contract`);
    }
  }

  const totalSteps = 4;
  const progressCount = completedSteps.length;

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-[#f6f6f8] font-sans text-slate-900 antialiased">
      <Sidebar
        agencyName={agency.name}
        agencyLogoUrl={agency.logoUrl ?? null}
        primaryColor={agency.primaryColor}
        clientName={onboarding.client.name}
        token={token}
        completedSteps={completedSteps}
        hasContract={hasContract}
        contractSigned={contractSigned}
      />

      <main className="flex-1 flex flex-col min-h-screen lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              {agency.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agency.logoUrl} alt={agency.name} className="h-7 w-auto object-contain max-w-[100px]" />
              ) : (
                <>
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: agency.primaryColor }}
                  >
                    <span className="material-symbols-outlined text-base">change_history</span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm truncate">{agency.name}</span>
                </>
              )}
            </div>
            <span className="text-xs text-slate-500 font-semibold shrink-0 ml-2">
              {progressCount}/{totalSteps} etapas
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-1 transition-all duration-500"
              style={{
                backgroundColor: agency.primaryColor,
                width: `${(progressCount / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
