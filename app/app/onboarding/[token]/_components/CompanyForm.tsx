"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SEGMENTS = [
  "Marketing Digital",
  "E-commerce",
  "SaaS / Tecnologia",
  "Varejo",
  "Saúde e Bem-estar",
  "Educação",
  "Jurídico / Contabilidade",
  "Imobiliário",
  "Outro",
];

const EMPLOYEE_RANGES = ["1 a 5", "6 a 20", "21 a 50", "51 a 200", "Mais de 200"];

interface CompanyFormProps {
  token: string;
  initialData: Record<string, unknown>;
}

export default function CompanyForm({ token, initialData }: CompanyFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      body: JSON.stringify({ stepNumber: 1, data }),
    });

    if (!res.ok) {
      setError("Erro ao salvar. Tente novamente.");
      setSaving(false);
      return;
    }

    router.push(`/onboarding/${token}/brand-assets`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10 flex flex-col gap-8"
    >
      {/* Row 1: Segmento + Funcionários */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700" htmlFor="segment">
            Segmento da empresa <span className="text-red-500">*</span>
          </label>
          <select
            id="segment"
            name="segment"
            required
            defaultValue={get("segment")}
            className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
          >
            <option value="">Selecione...</option>
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700" htmlFor="employees">
            Número de funcionários
          </label>
          <select
            id="employees"
            name="employees"
            defaultValue={get("employees")}
            className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
          >
            <option value="">Selecione...</option>
            {EMPLOYEE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Website */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700" htmlFor="website">
          Website
        </label>
        <input
          id="website"
          name="website"
          type="url"
          defaultValue={get("website")}
          placeholder="https://suaempresa.com.br"
          className="h-12 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
        />
      </div>

      {/* Social */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-700">Redes sociais</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "instagram", icon: "photo_camera", placeholder: "@suaempresa" },
            { name: "facebook", icon: "thumb_up", placeholder: "facebook.com/suaempresa" },
            { name: "linkedin", icon: "business_center", placeholder: "linkedin.com/company/..." },
            { name: "tiktok", icon: "music_note", placeholder: "@suaempresa" },
          ].map((social) => (
            <div key={social.name} className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[18px]">{social.icon}</span>
              </div>
              <input
                name={social.name}
                type="text"
                defaultValue={get(social.name)}
                placeholder={social.placeholder}
                className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-100" />

      {/* Textareas */}
      {[
        {
          name: "products",
          label: "Principais produtos ou serviços",
          required: true,
          placeholder: "Descreva brevemente o que sua empresa oferece...",
        },
        {
          name: "audience",
          label: "Público-alvo",
          required: true,
          placeholder: "Quem são seus clientes ideais? Idade, cargo, comportamento...",
        },
        {
          name: "differentiator",
          label: "Diferencial competitivo",
          required: false,
          placeholder: "O que faz a sua empresa se destacar da concorrência?",
        },
      ].map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700" htmlFor={field.name}>
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id={field.name}
            name={field.name}
            required={field.required}
            rows={3}
            defaultValue={get(field.name)}
            placeholder={field.placeholder}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition resize-none"
          />
        </div>
      ))}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
        >
          Sair
        </Link>
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
              <span>Salvar e Continuar</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
