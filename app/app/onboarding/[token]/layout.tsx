import { redirect } from "next/navigation";
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
            select: { name: true, logoUrl: true, primaryColor: true },
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

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-[#f6f6f8] font-sans text-slate-900 antialiased">
      <Sidebar
        agencyName={agency.name}
        agencyLogoUrl={agency.logoUrl ?? null}
        primaryColor={agency.primaryColor}
        clientName={onboarding.client.name}
        token={token}
        completedSteps={completedSteps}
      />

      <main className="flex-1 flex flex-col min-h-screen lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            {agency.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logoUrl} alt={agency.name} className="h-8 w-auto object-contain max-w-[120px]" />
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded flex items-center justify-center text-white"
                  style={{ backgroundColor: agency.primaryColor }}
                >
                  <span className="material-symbols-outlined text-lg">change_history</span>
                </div>
                <span className="font-bold text-slate-900">{agency.name}</span>
              </>
            )}
          </div>
          <span className="text-sm text-slate-500 font-medium">
            {completedSteps.length}/4 concluídos
          </span>
        </div>

        {children}
      </main>
    </div>
  );
}
