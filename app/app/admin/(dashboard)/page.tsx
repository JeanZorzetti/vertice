import Link from "next/link";
import { requireAgencySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NewOnboardingButton from "./_components/NewOnboardingButton";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const STEP_LABEL: Record<number, string> = {
  1: "Dados da Empresa",
  2: "Identidade Visual",
  3: "Plataformas",
  4: "Briefing",
};

export default async function AdminPage() {
  let session;
  try {
    session = await requireAgencySession();
  } catch {
    redirect("/admin/login");
  }

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [onboardings, totalClients, inProgress, pending, completedMonth] = await Promise.all([
    prisma.onboarding.findMany({
      where: { client: { agencyId: session.agencyId } },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, email: true, company: true } },
        steps: { select: { stepNumber: true } },
        assets: { select: { id: true } },
      },
    }),
    prisma.client.count({ where: { agencyId: session.agencyId } }),
    prisma.onboarding.count({
      where: { client: { agencyId: session.agencyId }, status: "IN_PROGRESS" },
    }),
    prisma.onboarding.count({
      where: { client: { agencyId: session.agencyId }, status: "PENDING" },
    }),
    prisma.onboarding.count({
      where: {
        client: { agencyId: session.agencyId },
        status: "COMPLETED",
        completedAt: { gte: firstOfMonth },
      },
    }),
  ]);

  const metrics = [
    { label: "Total de Clientes", value: totalClients, icon: "group" },
    { label: "Em Andamento", value: inProgress, icon: "pending_actions" },
    { label: "Aguardando Início", value: pending, icon: "schedule" },
    { label: "Concluídos este mês", value: completedMonth, icon: "task_alt" },
  ];

  return (
    <div className="flex-1 flex flex-col gap-8 p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Onboarding de Clientes</h1>
          <p className="text-sm text-slate-500">{onboardings.length} onboardings no total</p>
        </div>
        <NewOnboardingButton agencyId={session.agencyId} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500 text-[20px]">{m.icon}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-3xl font-black text-slate-900">{m.value}</span>
              <span className="text-xs text-slate-500 font-medium">{m.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {onboardings.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white rounded-xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-400 text-[32px]">group_add</span>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold text-slate-900">Nenhum cliente ainda</p>
            <p className="text-sm text-slate-500">Clique em &quot;Novo Cliente&quot; para começar.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Cliente", "Empresa", "Status", "Progresso", "Ações"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {onboardings.map((ob) => {
                  const completedCount = ob.steps.length;
                  const progress = Math.round((completedCount / 4) * 100);
                  const currentStepLabel =
                    ob.status === "COMPLETED"
                      ? "Concluído"
                      : STEP_LABEL[ob.currentStep] ?? `Etapa ${ob.currentStep}`;

                  return (
                    <tr key={ob.id} className="hover:bg-slate-50 transition-colors">
                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#135bec]/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[#135bec]">
                              {ob.client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{ob.client.name}</p>
                            <p className="text-xs text-slate-500 truncate">{ob.client.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Empresa */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-700">{ob.client.company ?? "—"}</span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[ob.status]}`}
                        >
                          {STATUS_LABEL[ob.status]}
                        </span>
                      </td>

                      {/* Progresso */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">{currentStepLabel}</span>
                            <span className="text-xs font-bold text-slate-700">{progress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#135bec] rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/onboardings/${ob.id}`}
                          className="flex items-center gap-1 text-xs font-bold text-[#135bec] hover:text-blue-700 transition-colors"
                        >
                          Ver detalhes
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
