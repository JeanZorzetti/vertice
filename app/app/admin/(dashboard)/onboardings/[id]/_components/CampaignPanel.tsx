"use client";

import { useState } from "react";

interface CampaignResult {
  spend: number | null;
  leads: number | null;
  revenue: number | null;
  notes: string | null;
}

interface CampaignPanelProps {
  onboardingId: string;
  initial: CampaignResult | null;
}

function fmt(v: number | null, prefix = "R$") {
  if (v === null) return "—";
  return `${prefix} ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtRoas(spend: number | null, revenue: number | null) {
  if (!spend || !revenue || spend === 0) return null;
  return (revenue / spend).toFixed(2);
}

export default function CampaignPanel({ onboardingId, initial }: CampaignPanelProps) {
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<CampaignResult | null>(initial);
  const [spend, setSpend] = useState(String(initial?.spend ?? ""));
  const [leads, setLeads] = useState(String(initial?.leads ?? ""));
  const [revenue, setRevenue] = useState(String(initial?.revenue ?? ""));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await fetch(`/api/agency/onboardings/${onboardingId}/campaign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spend, leads, revenue, notes }),
    });
    if (r.ok) {
      const d = await r.json();
      setResult(d);
      setEditing(false);
    }
    setSaving(false);
  }

  const roas = fmtRoas(result?.spend ?? null, result?.revenue ?? null);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-slate-500 text-[18px]">bar_chart</span>
          <h2 className="text-sm font-bold text-slate-900">Resultado da campanha</h2>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#135bec] hover:text-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            {result ? "Editar" : "Registrar"}
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Investimento (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={spend}
                onChange={(e) => setSpend(e.target.value)}
                placeholder="0,00"
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec]/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Leads gerados</label>
              <input
                type="number"
                min="0"
                step="1"
                value={leads}
                onChange={(e) => setLeads(e.target.value)}
                placeholder="0"
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec]/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receita gerada (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="0,00"
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec]/30"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Canal principal, resultado por campanha, etc."
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#135bec]/30"
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#135bec] text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      ) : result ? (
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Investido</span>
              <span className="text-lg font-black text-slate-900">{fmt(result.spend)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Leads</span>
              <span className="text-lg font-black text-slate-900">{result.leads ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Receita</span>
              <span className="text-lg font-black text-emerald-600">{fmt(result.revenue)}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">ROAS</span>
              <span className="text-lg font-black text-[#135bec]">{roas ? `${roas}x` : "—"}</span>
            </div>
          </div>
          {result.notes && (
            <p className="text-sm text-slate-600 border-t border-slate-100 pt-3">{result.notes}</p>
          )}
        </div>
      ) : (
        <div className="px-6 py-5 flex items-center gap-3">
          <p className="text-sm text-slate-400 italic">Nenhum resultado registrado.</p>
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-bold text-[#135bec] hover:underline"
          >
            Registrar agora
          </button>
        </div>
      )}
    </section>
  );
}
