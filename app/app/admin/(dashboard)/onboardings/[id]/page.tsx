import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAgencySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDownloadUrl } from "@/lib/r2";
import SendLinkButton from "./_components/SendLinkButton";
import AIAnalysisPanel from "./_components/AIAnalysisPanel";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
};

const STEP1_LABELS: Record<string, string> = {
  segment: "Segmento",
  employees: "Funcionários",
  website: "Website",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  products: "Produtos / Serviços",
  audience: "Público-alvo",
  differentiator: "Diferencial competitivo",
};

const STEP4_LABELS: Record<string, string> = {
  objective: "Objetivo principal",
  budget: "Orçamento mensal",
  timeframe: "Prazo esperado",
  competitors: "Principais concorrentes",
  hasMarketingHistory: "Já fez marketing digital",
  historyDetails: "Histórico de marketing",
  notes: "Observações adicionais",
};

const OBJECTIVE_LABELS: Record<string, string> = {
  leads: "Geração de Leads",
  sales: "Aumento de Vendas",
  awareness: "Awareness de Marca",
  retention: "Retenção / Fidelização",
};

function formatValue(key: string, value: unknown): string {
  if (!value || value === "") return "—";
  if (key === "objective") return OBJECTIVE_LABELS[String(value)] ?? String(value);
  if (key === "hasMarketingHistory") return value === "yes" ? "Sim" : "Não";
  return String(value);
}

export default async function OnboardingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let session;
  try {
    session = await requireAgencySession();
  } catch {
    redirect("/admin/login");
  }

  const { id } = await params;

  const onboarding = await prisma.onboarding.findUnique({
    where: { id },
    include: {
      client: { include: { agency: { select: { id: true, name: true } } } },
      steps: { orderBy: { stepNumber: "asc" } },
      assets: { orderBy: { uploadedAt: "asc" } },
      magicLinks: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  if (!onboarding) notFound();
  if (onboarding.client.agency.id !== session.agencyId) redirect("/admin");

  const assetsWithUrls = await Promise.all(
    onboarding.assets.map(async (a) => ({
      ...a,
      downloadUrl: await getDownloadUrl(a.r2Key),
    }))
  );

  const step1 = onboarding.steps.find((s) => s.stepNumber === 1);
  const step4 = onboarding.steps.find((s) => s.stepNumber === 4);
  const step1Data = (step1?.data ?? {}) as Record<string, unknown>;
  const step4Data = (step4?.data ?? {}) as Record<string, unknown>;

  const completedSteps = onboarding.steps.length;
  const progress = Math.round((completedSteps / 4) * 100);

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto w-full">
      {/* Back + print */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors w-fit"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Voltar à lista
        </Link>
        <a
          href={`/api/agency/onboardings/${id}/report`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Exportar relatório
        </a>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#135bec]/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-[#135bec]">
              {onboarding.client.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-black text-slate-900">{onboarding.client.name}</h1>
            <p className="text-sm text-slate-500">{onboarding.client.email}</p>
            {onboarding.client.company && (
              <p className="text-sm text-slate-500">{onboarding.client.company}</p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_STYLE[onboarding.status]}`}
          >
            {STATUS_LABEL[onboarding.status]}
          </span>
          <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{completedSteps} de 4 etapas</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#135bec] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <SendLinkButton clientEmail={onboarding.client.email} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main data — left 2/3 */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Step 1 */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
              >
                {step1 ? (
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                ) : "1"}
              </div>
              <h2 className="text-sm font-bold text-slate-900">Dados da Empresa</h2>
            </div>
            {step1 ? (
              <dl className="divide-y divide-slate-50">
                {Object.entries(STEP1_LABELS).map(([key, label]) => {
                  const val = formatValue(key, step1Data[key]);
                  if (val === "—" && !["products", "audience"].includes(key)) return null;
                  return (
                    <div key={key} className="grid grid-cols-2 gap-4 px-6 py-3">
                      <dt className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</dt>
                      <dd className="text-sm text-slate-800 break-words">{val}</dd>
                    </div>
                  );
                })}
              </dl>
            ) : (
              <p className="px-6 py-4 text-sm text-slate-400 italic">Ainda não preenchido.</p>
            )}
          </section>

          {/* Step 4 — Briefing */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step4 ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}
              >
                {step4 ? (
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                ) : "4"}
              </div>
              <h2 className="text-sm font-bold text-slate-900">Briefing Estratégico</h2>
            </div>
            {step4 ? (
              <dl className="divide-y divide-slate-50">
                {Object.entries(STEP4_LABELS).map(([key, label]) => {
                  const val = formatValue(key, step4Data[key]);
                  if (val === "—") return null;
                  return (
                    <div key={key} className="grid grid-cols-2 gap-4 px-6 py-3">
                      <dt className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</dt>
                      <dd className="text-sm text-slate-800 break-words">{val}</dd>
                    </div>
                  );
                })}
              </dl>
            ) : (
              <p className="px-6 py-4 text-sm text-slate-400 italic">Ainda não preenchido.</p>
            )}
          </section>

          {/* AI Analysis */}
          <AIAnalysisPanel
            onboardingId={id}
            initialAnalysis={onboarding.aiAnalysis ?? null}
          />
        </div>

        {/* Sidebar — right 1/3 */}
        <div className="flex flex-col gap-5">
          {/* Assets */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
              <span className="material-symbols-outlined text-slate-500 text-[18px]">folder</span>
              <h2 className="text-sm font-bold text-slate-900">
                Arquivos ({assetsWithUrls.length})
              </h2>
            </div>
            {assetsWithUrls.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-400 italic">Nenhum arquivo enviado.</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {assetsWithUrls.map((asset) => (
                  <li key={asset.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="material-symbols-outlined text-slate-400 text-[18px] shrink-0">
                      {asset.fileType.startsWith("image/") ? "image" : "picture_as_pdf"}
                    </span>
                    <p className="text-xs text-slate-700 font-medium truncate flex-1">{asset.fileName}</p>
                    <a
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#135bec] hover:text-blue-700 shrink-0"
                      title="Baixar"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Magic link history */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50">
              <span className="material-symbols-outlined text-slate-500 text-[18px]">mail</span>
              <h2 className="text-sm font-bold text-slate-900">Links enviados</h2>
            </div>
            {onboarding.magicLinks.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-400 italic">Nenhum link enviado ainda.</p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {onboarding.magicLinks.map((ml) => (
                  <li key={ml.id} className="px-5 py-3 flex flex-col gap-0.5">
                    <span className="text-xs text-slate-500">
                      {new Date(ml.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span
                      className={`text-xs font-semibold ${ml.usedAt ? "text-emerald-600" : ml.expiresAt < new Date() ? "text-slate-400" : "text-blue-600"}`}
                    >
                      {ml.usedAt ? "Acessado" : ml.expiresAt < new Date() ? "Expirado" : "Não acessado"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Timestamps */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Criado em</span>
              <span className="text-sm text-slate-800">
                {new Date(onboarding.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {onboarding.completedAt && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Concluído em</span>
                <span className="text-sm text-slate-800">
                  {new Date(onboarding.completedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
