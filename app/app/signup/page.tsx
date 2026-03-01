"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState("");

  function toSlug(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/agency/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agencyName: fd.get("agencyName"),
        slug: fd.get("slug"),
        name: fd.get("name"),
        email: fd.get("email"),
        password,
      }),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Erro interno." }));
      setError(msg ?? "Erro ao criar conta.");
      setLoading(false);
      return;
    }

    router.push("/admin/login?created=1");
  }

  return (
    <div className="min-h-screen w-full flex bg-[#f6f6f8]">
      {/* Left panel */}
      <div className="hidden lg:flex w-[480px] bg-[#0d121b] flex-col justify-between p-12 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#135bec] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl">change_history</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Vértice</span>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Crie sua conta e comece a onboarding seus clientes hoje.
          </h2>
          <ul className="flex flex-col gap-3">
            {[
              "Portal personalizado com a sua marca",
              "Magic link para o cliente — sem senha",
              "Coleta de assets, briefing e OAuth",
              "Notificações automáticas por e-mail",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-[#4c669a] text-sm">
                <span className="material-symbols-outlined text-[#135bec] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[#4c669a] text-sm">© 2025 Vértice · Powered by ROI Labs</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col gap-7">
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#135bec] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">change_history</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Vértice</span>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Criar conta</h1>
            <p className="text-slate-500 text-base">Preencha os dados da sua agência para começar.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Agency name */}
            <div className="flex flex-col gap-2">
              <label htmlFor="agencyName" className="text-sm font-bold text-slate-700">Nome da agência</label>
              <input
                id="agencyName"
                name="agencyName"
                type="text"
                required
                placeholder="ROI Labs"
                onChange={(e) => setSlug(toSlug(e.target.value))}
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
              />
            </div>

            {/* Slug */}
            <div className="flex flex-col gap-2">
              <label htmlFor="slug" className="text-sm font-bold text-slate-700">
                Identificador único <span className="font-normal text-slate-400">(slug)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  vertice.app/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(toSlug(e.target.value))}
                  placeholder="roi-labs"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-[100px] pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2 flex flex-col gap-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Dados do administrador</p>

              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-bold text-slate-700">Seu nome</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="João Silva"
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-bold text-slate-700">E-mail</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="joao@suaagencia.com.br"
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-sm font-bold text-slate-700">Senha</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm" className="text-sm font-bold text-slate-700">Confirmar</label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-[#135bec] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01] disabled:scale-100"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Criando conta...
                </>
              ) : (
                "Criar conta gratuita"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Já tem uma conta?{" "}
            <Link href="/admin/login" className="font-bold text-[#135bec] hover:underline">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
