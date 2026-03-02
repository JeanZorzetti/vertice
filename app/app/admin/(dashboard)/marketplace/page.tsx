"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string | null;
  usageCount: number;
  createdAt: string;
  agency: { name: string };
}

export default function MarketplacePage() {
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [imported, setImported] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/marketplace/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleImport(id: string) {
    setImporting(id);
    const r = await fetch(`/api/marketplace/templates/${id}/use`, { method: "POST" });
    if (r.ok) {
      setImported((prev) => new Set([...prev, id]));
    }
    setImporting(null);
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Marketplace</h1>
            <p className="text-sm text-slate-500 mt-0.5">Templates públicos compartilhados por outras agências</p>
          </div>
        </div>
        <Link
          href="/admin/templates"
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">content_copy</span>
          Meus templates
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="material-symbols-outlined animate-spin text-[#135bec] text-3xl">progress_activity</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-16 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 block mb-4">storefront</span>
          <p className="text-slate-600 font-semibold">Nenhum template público disponível ainda.</p>
          <p className="text-slate-400 text-sm mt-1">Publique seus templates em <Link href="/admin/templates" className="text-[#135bec] font-semibold hover:underline">Meus templates</Link> para contribuir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => {
            const isImported = imported.has(t.id);
            const isImporting = importing === t.id;
            return (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-violet-500 text-[22px]">storefront</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    {t.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{t.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">por <span className="font-semibold text-slate-600">{t.agency.name}</span></span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        {t.usageCount} {t.usageCount === 1 ? "uso" : "usos"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleImport(t.id)}
                  disabled={isImporting || isImported}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
                    isImported
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
                      : "bg-[#135bec] text-white hover:bg-blue-700 disabled:opacity-60"
                  }`}
                >
                  {isImported ? (
                    <>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Importado para minha biblioteca
                    </>
                  ) : isImporting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                      Importando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Importar template
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
