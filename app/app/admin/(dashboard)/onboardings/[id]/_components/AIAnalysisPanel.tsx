"use client";

import { useState } from "react";

interface AIAnalysisPanelProps {
  onboardingId: string;
  initialAnalysis: string | null;
}

export default function AIAnalysisPanel({ onboardingId, initialAnalysis }: AIAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/agency/onboardings/${onboardingId}/analyze`, {
        method: "POST",
      });
      if (!r.ok) {
        const body = await r.json();
        setError(body.error ?? "Erro ao gerar análise.");
        return;
      }
      const data = await r.json();
      setAnalysis(data.aiAnalysis);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // Render markdown-ish text: convert **bold**, ### headers, bullet points
  function renderMarkdown(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-sm font-black text-slate-900 mt-4 mb-1 first:mt-0">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2 key={i} className="text-base font-black text-slate-900 mt-5 mb-2 first:mt-0">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1 key={i} className="text-lg font-black text-slate-900 mt-5 mb-2 first:mt-0">
            {line.slice(2)}
          </h1>
        );
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={i} className="text-sm text-slate-700 ml-4 list-disc">
            {renderInline(line.slice(2))}
          </li>
        );
      }
      if (/^\d+\. /.test(line)) {
        const content = line.replace(/^\d+\. /, "");
        return (
          <li key={i} className="text-sm text-slate-700 ml-4 list-decimal">
            {renderInline(content)}
          </li>
        );
      }
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return (
        <p key={i} className="text-sm text-slate-700 leading-relaxed">
          {renderInline(line)}
        </p>
      );
    });
  }

  function renderInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#135bec] text-[18px]">auto_awesome</span>
          <h2 className="text-sm font-bold text-slate-900">Análise com IA</h2>
          {analysis && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Gerado
            </span>
          )}
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#135bec] text-white text-xs font-bold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
              Analisando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              {analysis ? "Re-analisar" : "Analisar briefing"}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100">
          <p className="text-xs text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {analysis ? (
        <div className="px-6 py-5 flex flex-col gap-1">{renderMarkdown(analysis)}</div>
      ) : (
        <div className="px-6 py-8 text-center">
          <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">auto_awesome</span>
          <p className="text-sm text-slate-400">
            Clique em &ldquo;Analisar briefing&rdquo; para gerar um relatório de IA com insights e próximos passos.
          </p>
        </div>
      )}
    </section>
  );
}
