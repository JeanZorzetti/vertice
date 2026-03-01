"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Analytics {
  totalClients: number;
  totalOnboardings: number;
  byStatus: { PENDING: number; IN_PROGRESS: number; COMPLETED: number };
  avgCompletionHours: number | null;
  dailySeries: Array<{ date: string; count: number }>;
  recentOnboardings: Array<{
    id: string;
    status: string;
    createdAt: string;
    completedAt: string | null;
    currentStep: number;
    client: { name: string; company: string | null };
  }>;
}

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

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agency/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <span className="material-symbols-outlined animate-spin text-[#135bec] text-3xl">progress_activity</span>
      </div>
    );
  }

  if (!data) return null;

  const completionRate =
    data.totalOnboardings > 0
      ? Math.round((data.byStatus.COMPLETED / data.totalOnboardings) * 100)
      : 0;

  // Simple sparkline — find max for scaling
  const maxDay = Math.max(...data.dailySeries.map((d) => d.count), 1);

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Métricas de onboarding da sua agência</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Clientes</span>
          <span className="text-3xl font-black text-slate-900">{data.totalClients}</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Onboardings</span>
          <span className="text-3xl font-black text-slate-900">{data.totalOnboardings}</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Taxa de conclusão</span>
          <span className="text-3xl font-black text-emerald-600">{completionRate}%</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tempo médio</span>
          <span className="text-3xl font-black text-slate-900">
            {data.avgCompletionHours !== null ? `${data.avgCompletionHours}h` : "—"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily series chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-900">Onboardings criados (últimos 30 dias)</h2>
          {data.dailySeries.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Nenhum dado no período.</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {data.dailySeries.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full bg-[#135bec]/80 rounded-t hover:bg-[#135bec] transition-colors cursor-default"
                    style={{ height: `${Math.max(4, (d.count / maxDay) * 112)}px` }}
                  />
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    {d.date}: {d.count}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-between text-xs text-slate-400">
            <span>{data.dailySeries[0]?.date ?? ""}</span>
            <span>{data.dailySeries[data.dailySeries.length - 1]?.date ?? ""}</span>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-slate-900">Por status</h2>
          <div className="flex flex-col gap-3">
            {(["PENDING", "IN_PROGRESS", "COMPLETED"] as const).map((s) => {
              const count = data.byStatus[s];
              const pct = data.totalOnboardings > 0 ? (count / data.totalOnboardings) * 100 : 0;
              return (
                <div key={s} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{STATUS_LABEL[s]}</span>
                    <span className="font-bold text-slate-900">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s === "COMPLETED" ? "bg-emerald-500" : s === "IN_PROGRESS" ? "bg-blue-500" : "bg-amber-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent onboardings table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-900">Onboardings recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Etapa</th>
                <th className="px-6 py-3">Criado em</th>
                <th className="px-6 py-3">Concluído em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.recentOnboardings.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/admin/onboardings/${o.id}`} className="font-semibold text-slate-900 hover:text-[#135bec]">
                      {o.client.name}
                    </Link>
                    {o.client.company && (
                      <p className="text-xs text-slate-500">{o.client.company}</p>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLE[o.status]}`}>
                      {STATUS_LABEL[o.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{o.currentStep} / 4</td>
                  <td className="px-6 py-3 text-slate-500 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-3 text-slate-500 text-xs">
                    {o.completedAt ? new Date(o.completedAt).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
