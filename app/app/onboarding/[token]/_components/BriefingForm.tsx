"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const OBJECTIVES = [
  { value: "leads", label: "Geração de Leads", icon: "person_add" },
  { value: "sales", label: "Aumento de Vendas", icon: "trending_up" },
  { value: "awareness", label: "Awareness de Marca", icon: "campaign" },
  { value: "retention", label: "Retenção / Fidelização", icon: "favorite" },
];

const BUDGETS = [
  "Até R$ 2.000",
  "R$ 2.000 – R$ 5.000",
  "R$ 5.000 – R$ 15.000",
  "R$ 15.000 – R$ 50.000",
  "Acima de R$ 50.000",
];

const TIMEFRAMES = [
  { value: "1-3m", label: "1 a 3 meses" },
  { value: "3-6m", label: "3 a 6 meses" },
  { value: "6-12m", label: "6 a 12 meses" },
];

interface BriefingFormProps {
  token: string;
  initialData: Record<string, unknown>;
}

export default function BriefingForm({ token, initialData }: BriefingFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasHistory, setHasHistory] = useState<boolean>(
    (initialData.hasMarketingHistory as string) === "yes"
  );

  const get = (key: string) => (initialData[key] as string) ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());

    const res = await fetch(`/api/onboarding/${token}/step`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepNumber: 4, data }),
    });

    if (!res.ok) {
      setError("Erro ao salvar. Tente novamente.");
      setSaving(false);
      return;
    }

    router.push(`/onboarding/${token}/done`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10 flex flex-col gap-8"
    >
      {/* Objetivo */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-700">
          Objetivo principal <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {OBJECTIVES.map((obj) => (
            <label
              key={obj.value}
              className="relative cursor-pointer"
            >
              <input
                type="radio"
                name="objective"
                value={obj.value}
                defaultChecked={get("objective") === obj.value}
                required
                className="peer sr-only"
              />
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 bg-slate-50 text-center transition-all peer-checked:border-[#135bec] peer-checked:bg-[#135bec]/5 peer-checked:shadow-sm hover:border-slate-300">
                <span className="material-symbols-outlined text-slate-400 peer-checked:text-[#135bec] text-[24px]">
                  {obj.icon}
                </span>
                <p className="text-xs font-semibold text-slate-700 leading-tight">{obj.label}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700" htmlFor="budget">
          Orçamento mensal em marketing <span className="text-red-500">*</span>
        </label>
        <select
          id="budget"
          name="budget"
          required
          defaultValue={get("budget")}
          className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
        >
          <option value="">Selecione o orçamento...</option>
          {BUDGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Timeframe */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-700">
          Prazo esperado para ver resultados <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {TIMEFRAMES.map((tf) => (
            <label key={tf.value} className="cursor-pointer">
              <input
                type="radio"
                name="timeframe"
                value={tf.value}
                defaultChecked={get("timeframe") === tf.value}
                required
                className="peer sr-only"
              />
              <div className="px-5 py-2.5 rounded-full border-2 border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition-all peer-checked:border-[#135bec] peer-checked:bg-[#135bec]/5 peer-checked:text-[#135bec] hover:border-slate-300 cursor-pointer">
                {tf.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Competitors */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700" htmlFor="competitors">
          Principais concorrentes
        </label>
        <textarea
          id="competitors"
          name="competitors"
          rows={2}
          defaultValue={get("competitors")}
          placeholder="Liste os principais concorrentes que você acompanha..."
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition resize-none"
        />
      </div>

      {/* History */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-700">
          Já fez marketing digital antes?
        </p>
        <div className="flex gap-3">
          {[
            { value: "yes", label: "Sim" },
            { value: "no", label: "Não" },
          ].map((opt) => (
            <label key={opt.value} className="cursor-pointer">
              <input
                type="radio"
                name="hasMarketingHistory"
                value={opt.value}
                defaultChecked={get("hasMarketingHistory") === opt.value}
                onChange={() => setHasHistory(opt.value === "yes")}
                className="peer sr-only"
              />
              <div className="px-5 py-2.5 rounded-full border-2 border-slate-200 bg-slate-50 text-sm font-semibold text-slate-600 transition-all peer-checked:border-[#135bec] peer-checked:bg-[#135bec]/5 peer-checked:text-[#135bec] hover:border-slate-300">
                {opt.label}
              </div>
            </label>
          ))}
        </div>

        {hasHistory && (
          <div className="flex flex-col gap-2 mt-1">
            <label className="text-sm font-medium text-slate-600" htmlFor="historyDetails">
              Quais canais e quais foram os resultados?
            </label>
            <textarea
              id="historyDetails"
              name="historyDetails"
              rows={2}
              defaultValue={get("historyDetails")}
              placeholder="Ex: Rodamos Google Ads por 6 meses, CAC de R$80, ROAS de 3x..."
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition resize-none"
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700" htmlFor="notes">
          Observações adicionais
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={get("notes")}
          placeholder="Alguma informação importante que devemos saber antes de começar?"
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <a
          href={`/onboarding/${token}/platforms`}
          className="px-6 py-3 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
        >
          Voltar
        </a>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#135bec] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:scale-100"
        >
          {saving ? (
            <>
              <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
              Salvando...
            </>
          ) : (
            <>
              <span>Concluir Onboarding</span>
              <span className="material-symbols-outlined text-lg">check_circle</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
