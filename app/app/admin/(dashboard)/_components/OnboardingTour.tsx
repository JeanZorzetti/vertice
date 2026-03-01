"use client";

import { useState } from "react";
import Link from "next/link";

const STEPS = [
  {
    icon: "palette",
    title: "Personalize sua agência",
    description: "Adicione seu logo e cor primária para que seus clientes vejam sua marca no portal de onboarding.",
    cta: "Ir para Configurações",
    href: "/admin/settings",
  },
  {
    icon: "person_add",
    title: "Crie seu primeiro onboarding",
    description: "Clique em \"Novo Cliente\" na tela principal, informe os dados do cliente e copie o link de onboarding.",
    cta: "Ir para Onboardings",
    href: "/admin",
  },
  {
    icon: "share",
    title: "Envie o link para o cliente",
    description: "Compartilhe o magic link por e-mail ou WhatsApp. O cliente preenche tudo em menos de 10 minutos.",
    cta: "Entendido",
    href: null,
  },
  {
    icon: "auto_awesome",
    title: "Analise com IA",
    description: "Quando o cliente concluir, abra o onboarding e clique em \"Analisar briefing\" para gerar insights automáticos.",
    cta: "Começar agora",
    href: null,
  },
];

interface OnboardingTourProps {
  agencyName: string;
}

export default function OnboardingTour({ agencyName }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  async function dismiss() {
    setDismissing(true);
    await fetch("/api/agency/onboarded", { method: "POST" });
    setDismissed(true);
  }

  if (dismissed) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#135bec] px-6 py-5">
          <p className="text-xs font-bold text-blue-200 uppercase tracking-wide">Bem-vindo ao Vértice</p>
          <h2 className="text-xl font-black text-white mt-0.5">Olá, {agencyName}!</h2>
          <p className="text-sm text-blue-200 mt-1">Siga estes 4 passos para começar em minutos.</p>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1 px-6 pt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#135bec]" : "bg-slate-200"}`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#135bec]/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[#135bec] text-[22px]">{current.icon}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Passo {step + 1} de {STEPS.length}</p>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{current.title}</h3>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{current.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={dismiss}
              disabled={dismissing}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Pular tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Voltar
                </button>
              )}
              {current.href ? (
                <Link
                  href={current.href}
                  onClick={isLast ? dismiss : () => setStep((s) => s + 1)}
                  className="px-5 py-2.5 bg-[#135bec] text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {current.cta}
                </Link>
              ) : (
                <button
                  onClick={isLast ? dismiss : () => setStep((s) => s + 1)}
                  disabled={dismissing}
                  className="px-5 py-2.5 bg-[#135bec] text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {isLast ? (dismissing ? "Salvando..." : current.cta) : current.cta}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
