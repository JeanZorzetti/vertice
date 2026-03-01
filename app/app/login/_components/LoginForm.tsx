"use client";

import { useState } from "react";

interface AgencyBranding {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
}

interface LoginFormProps {
  agency: AgencyBranding | null;
  error?: string | null;
}

export default function LoginForm({ agency, error: initialError }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(initialError ?? "");

  const color = agency?.primaryColor ?? "#135bec";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      setError("Erro ao enviar o link. Tente novamente.");
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${color}1a` }}
        >
          <span
            className="material-symbols-outlined text-3xl"
            style={{ color, fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black text-slate-900">Verifique seu e-mail</h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Enviamos um link de acesso para <strong className="text-slate-700">{email}</strong>.
            <br />O link expira em <strong>1 hora</strong>.
          </p>
        </div>
        <button
          onClick={() => { setSent(false); setEmail(""); }}
          className="text-sm font-semibold hover:underline"
          style={{ color }}
        >
          Usar outro e-mail
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 ml-1" htmlFor="email">
          E-mail corporativo
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>mail</span>
          </div>
          <input
            className="w-full h-14 pl-12 pr-4 rounded-xl border-0 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm transition-all text-base outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#f6f6f8]"
            style={{ "--tw-ring-color": color } as React.CSSProperties}
            id="email"
            name="email"
            placeholder="nome@empresa.com.br"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
        className="w-full h-14 text-white text-base font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-60"
        style={{ backgroundColor: color, boxShadow: `0 8px 24px ${color}33` }}
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            Enviando...
          </>
        ) : (
          <>
            <span>Enviar Link de Acesso</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform" style={{ fontSize: "20px" }}>
              arrow_forward
            </span>
          </>
        )}
      </button>
    </form>
  );
}
