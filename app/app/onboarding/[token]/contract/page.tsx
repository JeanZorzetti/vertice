"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface OnboardingData {
  id: string;
  contractSignedAt: string | null;
  client: {
    name: string;
    agency: {
      primaryColor: string;
      contractTemplate: string | null;
    };
  };
}

export default function ContractPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [data, setData] = useState<OnboardingData | null>(null);
  const [signerName, setSignerName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/onboarding/${token}`)
      .then((r) => r.json())
      .then((d: OnboardingData) => {
        setData(d);
        // Already signed → go to step 1
        if (d.contractSignedAt) {
          router.replace(`/onboarding/${token}`);
        }
      })
      .catch(() => router.replace(`/onboarding/${token}`));
  }, [token, router]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      setError("Você precisa confirmar que leu e concorda com o contrato.");
      return;
    }
    if (!signerName.trim()) {
      setError("Digite seu nome completo para assinar.");
      return;
    }

    setSigning(true);
    setError("");

    const res = await fetch(`/api/onboarding/${token}/sign-contract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signerName }),
    });

    if (res.ok) {
      router.push(`/onboarding/${token}`);
    } else {
      const { error: msg } = await res.json().catch(() => ({ error: "Erro ao assinar." }));
      setError(msg ?? "Erro ao assinar.");
      setSigning(false);
    }
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <span className="material-symbols-outlined animate-spin text-slate-400 text-3xl">progress_activity</span>
      </div>
    );
  }

  const primaryColor = data.client.agency.primaryColor;
  const contractText = data.client.agency.contractTemplate ?? "";

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4 sm:px-8">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Header */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
            Antes de começar
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Contrato de Prestação de Serviços</h1>
          <p className="text-sm text-slate-500 mt-1">
            Leia o contrato abaixo e assine eletronicamente para continuar.
          </p>
        </div>

        {/* Contract text */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 max-h-96 overflow-y-auto">
          <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">
            {contractText}
          </pre>
        </div>

        {/* Signature form */}
        <form onSubmit={handleSign} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-base font-bold text-slate-900">Assinatura eletrônica</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="signerName" className="text-sm font-bold text-slate-700">
              Nome completo do signatário
            </label>
            <input
              id="signerName"
              type="text"
              required
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Digite seu nome completo como no documento"
              className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition"
              style={{ "--tw-ring-color": primaryColor } as React.CSSProperties}
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded border-slate-300 shrink-0 cursor-pointer"
            />
            <span className="text-sm text-slate-600 leading-relaxed">
              Li e concordo com os termos do contrato acima. Entendo que esta assinatura eletrônica tem validade jurídica conforme a Lei nº 14.063/2020.
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={signing || !agreed}
            className="h-12 rounded-xl text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
            style={{ backgroundColor: primaryColor }}
          >
            {signing ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                Assinando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">draw</span>
                Assinar e continuar
              </>
            )}
          </button>

          <p className="text-xs text-slate-400 text-center">
            Data e hora da assinatura, nome e IP serão registrados automaticamente.
          </p>
        </form>
      </div>
    </div>
  );
}
