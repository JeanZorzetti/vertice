"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STEP_LABELS = ["Dados da Empresa", "Identidade Visual", "Plataformas", "Briefing"];

const STEP_PATHS = [
  "",               // step 1 → /onboarding/[token]
  "/brand-assets",  // step 2
  "/platforms",     // step 3
  "/briefing",      // step 4
];

interface SidebarProps {
  agencyName: string;
  clientName: string;
  token: string;
  completedSteps: number[];
}

export default function Sidebar({ agencyName, clientName, token, completedSteps }: SidebarProps) {
  const pathname = usePathname();

  function getStepStatus(index: number): "done" | "active" | "pending" {
    const stepNumber = index + 1;
    if (completedSteps.includes(stepNumber)) return "done";
    const path = `/onboarding/${token}${STEP_PATHS[index]}`;
    if (pathname === path) return "active";
    return "pending";
  }

  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex-shrink-0 hidden lg:flex flex-col justify-between h-screen fixed left-0 top-0 z-10">
      <div className="p-8 flex flex-col gap-10">
        {/* Logo / Agency */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#135bec] flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-2xl">change_history</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 truncate">{agencyName}</h2>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-lg font-bold leading-normal">Configuração do Onboarding</h1>
          <p className="text-slate-500 text-sm font-medium">Complete seu perfil para começarmos.</p>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2">
          {STEP_LABELS.map((label, i) => {
            const status = getStepStatus(i);
            const href = `/onboarding/${token}${STEP_PATHS[i]}`;

            if (status === "done") {
              return (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span
                    className="material-symbols-outlined text-green-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <p className="text-slate-700 text-sm font-semibold">{label}</p>
                </Link>
              );
            }

            if (status === "active") {
              return (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#135bec]/10 border-l-4 border-[#135bec]"
                >
                  <div className="text-[#135bec] w-6 h-6 flex items-center justify-center rounded-full bg-[#135bec]/20 text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-[#135bec] text-sm font-bold">{label}</p>
                </div>
              );
            }

            return (
              <div key={label} className="flex items-center gap-3 px-3 py-2 rounded-lg opacity-50">
                <div className="text-slate-400 w-6 h-6 flex items-center justify-center rounded-full border border-slate-300 text-xs font-medium shrink-0">
                  {i + 1}
                </div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* User info */}
      <div className="p-8 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-slate-500">person</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-sm font-bold text-slate-900 truncate">{clientName}</p>
            <p className="text-xs text-slate-500 truncate">{agencyName}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
