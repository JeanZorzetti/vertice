"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  usageCount: number;
  createdAt: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function load() {
    const r = await fetch("/api/agency/templates");
    setTemplates(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const r = await fetch("/api/agency/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });
    if (r.ok) {
      setName("");
      setDescription("");
      setCreating(false);
      load();
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este template?")) return;
    setDeletingId(id);
    await fetch(`/api/agency/templates/${id}`, { method: "DELETE" });
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  async function handleTogglePublic(id: string, current: boolean) {
    setTogglingId(id);
    const r = await fetch(`/api/agency/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !current }),
    });
    if (r.ok) {
      setTemplates((prev) =>
        prev.map((t) => t.id === id ? { ...t, isPublic: !current } : t)
      );
    }
    setTogglingId(null);
  }

  return (
    <div className="flex-1 flex flex-col gap-6 p-6 md:p-8 max-w-4xl mx-auto w-full">
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
            <h1 className="text-2xl font-black text-slate-900">Templates</h1>
            <p className="text-sm text-slate-500 mt-0.5">Fluxos de onboarding reutilizáveis</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/marketplace"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">storefront</span>
            Marketplace
          </Link>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#135bec] text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo template
          </button>
        </div>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Novo template</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Nome *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: E-commerce padrão"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135bec]/30"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva quando usar este template..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#135bec]/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => setCreating(false)}
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
        </div>
      )}

      {/* Template list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="material-symbols-outlined animate-spin text-[#135bec] text-3xl">progress_activity</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 block mb-3">content_copy</span>
          <p className="text-slate-500 text-sm">Nenhum template criado ainda.</p>
          <button
            onClick={() => setCreating(true)}
            className="mt-4 text-sm font-bold text-[#135bec] hover:underline"
          >
            Criar primeiro template
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#135bec]/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#135bec] text-[20px]">content_copy</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    {t.isPublic && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-violet-200">
                        <span className="material-symbols-outlined text-[12px]">public</span>
                        Público
                      </span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{t.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-slate-400">
                      Criado em {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    {t.usageCount > 0 && (
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">download</span>
                        {t.usageCount} {t.usageCount === 1 ? "uso no marketplace" : "usos no marketplace"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleTogglePublic(t.id, t.isPublic)}
                  disabled={togglingId === t.id}
                  title={t.isPublic ? "Tornar privado" : "Publicar no marketplace"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                    t.isPublic
                      ? "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">{t.isPublic ? "public_off" : "public"}</span>
                  {t.isPublic ? "Tornar privado" : "Publicar"}
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Excluir"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
