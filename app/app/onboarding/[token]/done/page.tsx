import { prisma } from "@/lib/prisma";

const NEXT_STEPS = [
  {
    icon: "manage_search",
    title: "Análise das informações",
    desc: "Nossa equipe vai revisar todos os dados fornecidos e montar a sua estratégia personalizada.",
  },
  {
    icon: "phone_in_talk",
    title: "Call de kickoff",
    desc: "Entraremos em contato em até 24–48 horas úteis para agendar a call de kickoff do projeto.",
  },
  {
    icon: "rocket_launch",
    title: "Início das campanhas",
    desc: "Com a estratégia aprovada, iniciamos a produção dos criativos e o setup das campanhas.",
  },
];

export default async function OnboardingDone({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const onboarding = await prisma.onboarding.findUnique({
    where: { token },
    include: {
      client: {
        include: { agency: { select: { name: true } } },
      },
    },
  });

  const clientName = onboarding?.client.name.split(" ")[0] ?? "Cliente";
  const agencyName = onboarding?.client.agency.name ?? "nossa equipe";

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-8">
      <div className="w-full max-w-2xl flex flex-col items-center gap-10 text-center">
        {/* Icon */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-emerald-500 text-[64px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-[#135bec] rounded-full flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-[18px]">star</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Onboarding Concluído! 🎉
          </h1>
          <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
            Parabéns, <strong className="text-slate-900">{clientName}</strong>! A equipe da{" "}
            <strong className="text-[#135bec]">{agencyName}</strong> já recebeu todas as suas informações
            e irá analisar tudo com atenção.
          </p>
        </div>

        {/* Divider */}
        <div className="w-16 h-1 rounded-full bg-[#135bec]/20" />

        {/* Next Steps */}
        <div className="w-full flex flex-col gap-4 text-left">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500 text-center mb-2">
            O que acontece agora
          </p>
          {NEXT_STEPS.map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-[#135bec]/10 flex items-center justify-center text-[#135bec] shrink-0">
                <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-slate-900">{step.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:justify-center">
          <a
            href={`/onboarding/${token}`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Ver meu onboarding
          </a>
        </div>

        <p className="text-xs text-slate-400">
          Dúvidas? Entre em contato com a equipe da {agencyName} pelo e-mail ou WhatsApp.
        </p>
      </div>
    </div>
  );
}
