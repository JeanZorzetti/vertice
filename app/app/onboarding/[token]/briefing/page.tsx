import { prisma } from "@/lib/prisma";
import BriefingForm from "../_components/BriefingForm";

export default async function OnboardingStep4({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const onboarding = await prisma.onboarding.findUnique({
    where: { token },
    include: {
      steps: { where: { stepNumber: 4 }, take: 1 },
    },
  });

  const initialData = (onboarding?.steps[0]?.data as Record<string, unknown>) ?? {};

  return (
    <div className="flex-1 flex justify-center py-10 px-4 sm:px-8">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-sm text-[#135bec] font-medium mb-1">
            <span>Etapa 4 de 4</span>
            <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-full bg-[#135bec] rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Briefing Estratégico
          </h1>
          <p className="text-slate-500 text-lg">
            Essas informações vão direcionar toda a estratégia de marketing da sua empresa.
          </p>
        </div>

        <BriefingForm token={token} initialData={initialData} />
      </div>
    </div>
  );
}
