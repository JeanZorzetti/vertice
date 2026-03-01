"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface BillingInfo {
  plan: string;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  clientLimit: number;
  mpSubscriptionId: string | null;
  mpSubscriptionStatus: string | null;
  plans: Array<{
    key: string;
    name: string;
    price: number;
    clientLimit: number;
    description: string;
    current: boolean;
  }>;
}

const PLAN_LABEL: Record<string, string> = {
  trial: "Trial gratuito",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
  inactive: "Inativo",
};

const PLAN_COLOR: Record<string, string> = {
  trial: "bg-amber-50 text-amber-700 border border-amber-200",
  starter: "bg-blue-50 text-blue-700 border border-blue-200",
  pro: "bg-violet-50 text-violet-700 border border-violet-200",
  agency: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  inactive: "bg-red-50 text-red-700 border border-red-200",
};

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && new URL(window.location.href).searchParams.get("success") === "1") {
      setSuccess(true);
    }
    fetch("/api/agency/billing")
      .then((r) => r.json())
      .then((d) => setBilling(d))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(planKey: string) {
    setSubscribing(planKey);
    const r = await fetch("/api/agency/billing/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const data = await r.json();
    if (data.initPoint) {
      window.location.href = data.initPoint;
    } else {
      alert(data.error ?? "Erro ao criar assinatura.");
      setSubscribing(null);
    }
  }

  async function handleCancel() {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Você perderá acesso ao fim do período pago.")) return;
    setCancelling(true);
    const r = await fetch("/api/agency/billing/cancel", { method: "POST" });
    const data = await r.json();
    if (data.ok) {
      window.location.reload();
    } else {
      alert(data.error ?? "Erro ao cancelar.");
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <span className="material-symbols-outlined animate-spin text-[#135bec] text-3xl">progress_activity</span>
      </div>
    );
  }

  if (!billing) return null;

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin" className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Plano e Cobrança</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gerencie sua assinatura do Vértice</p>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="text-sm font-semibold text-emerald-700">Assinatura ativada com sucesso! Seja bem-vindo ao Vértice.</p>
        </div>
      )}

      {/* Current plan card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-slate-900">Plano atual</span>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${PLAN_COLOR[billing.plan] ?? PLAN_COLOR.trial}`}>
              {PLAN_LABEL[billing.plan] ?? billing.plan}
            </span>
          </div>
          {billing.trialDaysLeft !== null && (
            <p className="text-sm text-amber-600 font-semibold">
              {billing.trialDaysLeft > 0
                ? `${billing.trialDaysLeft} dia${billing.trialDaysLeft !== 1 ? "s" : ""} restante${billing.trialDaysLeft !== 1 ? "s" : ""} de trial`
                : "Trial expirado — assine para continuar"}
            </p>
          )}
          <p className="text-sm text-slate-500">
            {billing.clientLimit === -1
              ? "Clientes ilimitados"
              : `Até ${billing.clientLimit} cliente${billing.clientLimit !== 1 ? "s" : ""} ativo${billing.clientLimit !== 1 ? "s" : ""}`}
          </p>
        </div>
        {billing.mpSubscriptionId && billing.mpSubscriptionStatus === "authorized" && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-60"
          >
            {cancelling ? "Cancelando..." : "Cancelar assinatura"}
          </button>
        )}
      </div>

      {/* Plans grid */}
      <div>
        <h2 className="text-sm font-black text-slate-900 mb-4">Escolha um plano</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {billing.plans.map((plan) => (
            <div
              key={plan.key}
              className={`bg-white rounded-xl border shadow-sm p-6 flex flex-col gap-4 relative ${plan.key === "pro" ? "border-[#135bec] shadow-[#135bec]/10 shadow-md" : "border-slate-200"}`}
            >
              {plan.key === "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#135bec] text-white text-xs font-bold px-3 py-1 rounded-full">Mais popular</span>
                </div>
              )}
              <div>
                <p className="text-base font-black text-slate-900">{plan.name}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-black text-slate-900">R${plan.price}</span>
                  <span className="text-sm text-slate-500">/mês</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
              </div>
              <ul className="flex flex-col gap-1.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {plan.clientLimit === -1 ? "Clientes ilimitados" : `Até ${plan.clientLimit} clientes`}
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Análise com IA
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Google Drive + WhatsApp
                </li>
                {plan.key !== "starter" && (
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Templates ilimitados
                  </li>
                )}
                {plan.key === "agency" && (
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Suporte prioritário
                  </li>
                )}
              </ul>
              {plan.current ? (
                <span className="w-full text-center py-2.5 rounded-lg bg-slate-100 text-sm font-bold text-slate-500">
                  Plano atual
                </span>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={subscribing !== null}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 ${plan.key === "pro" ? "bg-[#135bec] text-white hover:bg-blue-700" : "bg-slate-900 text-white hover:bg-slate-700"}`}
                >
                  {subscribing === plan.key ? "Redirecionando..." : `Assinar ${plan.name}`}
                </button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">
          Pagamento processado com segurança via Mercado Pago. Cancele quando quiser.
        </p>
      </div>
    </div>
  );
}
