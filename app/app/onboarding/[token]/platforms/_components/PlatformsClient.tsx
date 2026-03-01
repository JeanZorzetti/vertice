"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type Connection = { platform: string; connectedAt: string };

const PLATFORMS = [
  {
    key: "META",
    name: "Meta Business",
    description: "Facebook Ads & Instagram Ads",
    icon: "campaign",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    oauthPath: "meta",
  },
  {
    key: "GOOGLE_ADS",
    name: "Google Ads",
    description: "Search, Display & YouTube Ads",
    icon: "ads_click",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    oauthPath: "google",
  },
  {
    key: "GOOGLE_ANALYTICS",
    name: "Google Analytics 4",
    description: "Análise de tráfego e comportamento",
    icon: "bar_chart",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    oauthPath: "google",
  },
  {
    key: "WORDPRESS",
    name: "WordPress",
    description: "Gestão de conteúdo e SEO",
    icon: "web",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    oauthPath: null, // manual — "Na call"
  },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]["key"];

interface Props {
  token: string;
  connections: Connection[];
  successPlatform: string | null;
  errorCode: string | null;
}

export default function PlatformsClient({
  token,
  connections,
  successPlatform,
  errorCode,
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [localConnections, setLocalConnections] = useState(connections);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Show toast on redirect with ?success= or ?error=
  useEffect(() => {
    if (successPlatform) {
      const label =
        successPlatform === "meta"
          ? "Meta Business"
          : successPlatform === "google"
          ? "Google"
          : successPlatform;
      setToast({ type: "success", message: `${label} conectado com sucesso!` });
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
    if (errorCode) {
      setToast({ type: "error", message: `Erro ao conectar: ${errorCode.replace(/_/g, " ")}` });
      const t = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(t);
    }
  }, [successPlatform, errorCode]);

  const isConnected = (key: PlatformKey) =>
    localConnections.some((c) => c.platform === key);

  async function handleConnect(oauthPath: string) {
    window.location.href = `/api/oauth/${oauthPath}?token=${token}`;
  }

  async function handleDisconnect(key: PlatformKey) {
    setDisconnecting(key);
    const res = await fetch(
      `/api/onboarding/${token}/connections?platform=${key}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setLocalConnections((prev) => prev.filter((c) => c.platform !== key));
    }
    setDisconnecting(null);
  }

  async function handleContinue() {
    setSaving(true);
    const connectedPlatforms = localConnections.map((c) => c.platform);
    const res = await fetch(`/api/onboarding/${token}/step`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepNumber: 3,
        data: { platforms: connectedPlatforms },
      }),
    });
    if (!res.ok) {
      setToast({ type: "error", message: "Erro ao salvar. Tente novamente." });
      setSaving(false);
      return;
    }
    router.push(`/onboarding/${token}/briefing`);
  }

  return (
    <div className="flex-1 flex justify-center py-10 px-4 sm:px-8">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold transition-all ${
              toast.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {toast.type === "success" ? "check_circle" : "error"}
            </span>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-sm text-[#135bec] font-medium mb-1">
            <span>Etapa 3 de 4</span>
            <div className="h-1.5 w-32 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-[#135bec] rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Plataformas
          </h1>
          <p className="text-slate-500 text-lg">
            Conecte suas plataformas de mídia para darmos acesso à nossa equipe.
            Você pode conectar agora ou durante a call de kickoff.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10 flex flex-col gap-8">
          {/* Platform list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLATFORMS.map((platform) => {
              const connected = isConnected(platform.key);
              return (
                <div
                  key={platform.key}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    connected
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${platform.iconBg} flex items-center justify-center ${platform.iconColor} shrink-0`}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {platform.icon}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">
                      {platform.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {platform.description}
                    </p>
                  </div>

                  {/* Action button */}
                  {platform.oauthPath === null ? (
                    <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-full shrink-0">
                      Na call
                    </span>
                  ) : connected ? (
                    <button
                      onClick={() => handleDisconnect(platform.key)}
                      disabled={disconnecting === platform.key}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 rounded-full shrink-0 transition-colors disabled:opacity-60"
                    >
                      {disconnecting === platform.key ? (
                        <span className="material-symbols-outlined text-[14px] animate-spin">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[14px]">
                          check_circle
                        </span>
                      )}
                      Conectado
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.oauthPath)}
                      className="flex items-center gap-1 text-xs font-semibold text-[#135bec] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full shrink-0 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        add_link
                      </span>
                      Conectar
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <a
              href={`/onboarding/${token}/brand-assets`}
              className="px-6 py-3 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              Voltar
            </a>
            <button
              type="button"
              onClick={handleContinue}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-[#135bec] hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] disabled:scale-100"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">
                    progress_activity
                  </span>
                  Salvando...
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
