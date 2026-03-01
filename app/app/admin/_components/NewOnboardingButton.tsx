"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NewOnboardingButtonProps {
  agencyId: string;
}

type Step = "form" | "success";

export default function NewOnboardingButton({ agencyId }: NewOnboardingButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [created, setCreated] = useState<{
    clientName: string;
    clientEmail: string;
    onboardingId: string;
  } | null>(null);

  function openModal() {
    setOpen(true);
    setStep("form");
    setError("");
    setLinkSent(false);
    setCreated(null);
  }

  function closeModal() {
    setOpen(false);
    if (step === "success") {
      router.refresh();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/agency/onboardings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: fd.get("clientName"),
        email: fd.get("email"),
        company: fd.get("company") || undefined,
        phone: fd.get("phone") || undefined,
      }),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Erro interno." }));
      setError(msg ?? "Erro ao criar onboarding.");
      setLoading(false);
      return;
    }

    const onboarding = await res.json();
    setCreated({
      clientName: onboarding.client.name,
      clientEmail: onboarding.client.email,
      onboardingId: onboarding.id,
    });
    setStep("success");
    setLoading(false);
  }

  async function sendMagicLink() {
    if (!created) return;
    setLinkSent(false);
    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: created.clientEmail }),
    });
    if (res.ok) setLinkSent(true);
  }

  // Prevent body scroll when modal is open
  if (open) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#135bec] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
      >
        <span className="material-symbols-outlined text-[18px]">person_add</span>
        Novo Cliente
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 z-10">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#135bec]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#135bec] text-[20px]">
                    {step === "form" ? "person_add" : "check_circle"}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">
                    {step === "form" ? "Novo Cliente" : "Cliente criado!"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {step === "form" ? "Preencha os dados do cliente" : "Envie o link de acesso"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {step === "form" ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">
                      Nome do cliente <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="clientName"
                      type="text"
                      required
                      placeholder="João Silva"
                      className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700">
                      E-mail <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="joao@empresa.com.br"
                      className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Empresa</label>
                      <input
                        name="company"
                        type="text"
                        placeholder="Empresa Ltda"
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">WhatsApp</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-[#135bec] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
                    >
                      {loading ? (
                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                      ) : (
                        "Criar cliente"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-emerald-600 text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      <p className="text-sm font-bold text-emerald-800">{created?.clientName}</p>
                    </div>
                    <p className="text-xs text-emerald-700 pl-7">{created?.clientEmail}</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-sm font-bold text-slate-700">Enviar link de acesso</p>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      O cliente receberá um e-mail com o link para acessar o portal de onboarding.
                    </p>
                    {linkSent ? (
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-xl px-4 py-3 font-medium">
                        <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                        Link enviado com sucesso!
                      </div>
                    ) : (
                      <button
                        onClick={sendMagicLink}
                        className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#135bec] hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        Enviar link por e-mail
                      </button>
                    )}
                  </div>

                  <button
                    onClick={closeModal}
                    className="w-full h-11 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Fechar e ver lista
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
