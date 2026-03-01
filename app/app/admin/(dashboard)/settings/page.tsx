"use client";

import { useState, useEffect, useRef } from "react";

interface AgencySettings {
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#135bec");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const colorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/agency/settings")
      .then((r) => r.json())
      .then((data: AgencySettings) => {
        setSettings(data);
        setName(data.name);
        setLogoUrl(data.logoUrl ?? "");
        setPrimaryColor(data.primaryColor);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/agency/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logoUrl, primaryColor }),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Erro interno." }));
      setError(msg ?? "Erro ao salvar.");
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">progress_activity</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8 p-6 md:p-8 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configurações da Agência</h1>
        <p className="text-sm text-slate-500">Personalize o portal de onboarding dos seus clientes.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Identity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Identidade</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-bold text-slate-700">Nome da agência</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">
              Slug <span className="font-normal text-slate-400">(não editável)</span>
            </label>
            <div className="h-12 rounded-xl border border-slate-100 bg-slate-50 px-4 flex items-center text-sm text-slate-500">
              {settings.slug}
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Branding</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="logoUrl" className="text-sm font-bold text-slate-700">
              URL do logo <span className="font-normal text-slate-400">(PNG/SVG, recomendado 200×60px)</span>
            </label>
            <input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://suaagencia.com.br/logo.png"
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
            />
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Preview do logo"
                className="h-10 w-auto object-contain rounded border border-slate-100 p-1 bg-white"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="primaryColor" className="text-sm font-bold text-slate-700">Cor primária</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => colorRef.current?.click()}
                className="w-12 h-12 rounded-xl border-2 border-slate-200 shadow-sm transition hover:scale-105 shrink-0"
                style={{ backgroundColor: primaryColor }}
              />
              <input
                ref={colorRef}
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="sr-only"
              />
              <input
                id="primaryColor"
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#135bec"
                maxLength={7}
                className="h-12 w-36 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition uppercase"
              />
              <p className="text-xs text-slate-400">
                Usada nos botões, sidebar e links do portal do cliente.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-slate-100 bg-[#f6f6f8] p-4 flex flex-col gap-2">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="material-symbols-outlined text-xl">change_history</span>
              </div>
              <span className="font-bold text-slate-900">{name || "Sua Agência"}</span>
            </div>
            <button
              type="button"
              className="self-start mt-1 px-4 py-2 rounded-lg text-white text-sm font-bold"
              style={{ backgroundColor: primaryColor }}
            >
              Acessar Portal →
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-12 px-8 flex items-center gap-2 rounded-xl bg-[#135bec] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01] disabled:scale-100"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </button>
          {saved && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              Salvo com sucesso
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
