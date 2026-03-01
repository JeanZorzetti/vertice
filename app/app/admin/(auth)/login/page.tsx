"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/agency/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Erro interno." }));
      setError(msg ?? "Credenciais inválidas.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
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
          <span className="text-sm text-[#4c669a] font-medium ml-1">Admin</span>
        </div>

        <div className="flex flex-col gap-6">
          <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
            Gerencie o onboarding dos seus clientes em um único lugar.
          </h2>
          <p className="text-[#4c669a] text-base leading-relaxed">
            Crie portais personalizados, acompanhe o progresso em tempo real e receba os dados dos seus clientes organizados e prontos para uso.
          </p>
        </div>

        <p className="text-[#4c669a] text-sm">
          © 2025 Vértice · Powered by ROI Labs
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#135bec] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">change_history</span>
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">Vértice Admin</span>
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Acesso restrito</h1>
            <p className="text-slate-500 text-base">
              Entre com as credenciais da sua equipe para acessar o painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-bold text-slate-700">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@suaagencia.com.br"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-bold text-slate-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
              />
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
              className="mt-2 h-12 flex items-center justify-center gap-2 rounded-xl bg-[#135bec] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.01] disabled:scale-100"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Entrando...
                </>
              ) : (
                "Entrar no painel"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Ainda não tem uma conta?{" "}
            <Link href="/signup" className="font-bold text-[#135bec] hover:underline">
              Criar conta gratuita
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
