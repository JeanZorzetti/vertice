"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface AgencySettings {
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  webhookUrl: string | null;
  whatsappPhone: string | null;
  contractTemplate: string | null;
  pmTool: string | null;
  pmApiKey: string | null;
  pmApiKey2: string | null;
  pmListId: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#135bec");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [contractTemplate, setContractTemplate] = useState("");
  const [pmTool, setPmTool] = useState("");
  const [pmApiKey, setPmApiKey] = useState("");
  const [pmApiKey2, setPmApiKey2] = useState("");
  const [pmListId, setPmListId] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const colorRef = useRef<HTMLInputElement>(null);

  // API Key state
  const [hasApiKey, setHasApiKey] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);

  useEffect(() => {
    fetch("/api/agency/settings")
      .then((r) => r.json())
      .then((data: AgencySettings) => {
        setSettings(data);
        setName(data.name);
        setLogoUrl(data.logoUrl ?? "");
        setPrimaryColor(data.primaryColor);
        setWebhookUrl(data.webhookUrl ?? "");
        setWhatsappPhone(data.whatsappPhone ?? "");
        setContractTemplate(data.contractTemplate ?? "");
        setPmTool(data.pmTool ?? "");
        setPmApiKey(data.pmApiKey ?? "");
        setPmApiKey2(data.pmApiKey2 ?? "");
        setPmListId(data.pmListId ?? "");
      });
    fetch("/api/agency/api-key").then((r) => r.json()).then((d) => setHasApiKey(d.hasKey ?? false));
  }, []);

  const handleGenerateKey = useCallback(async () => {
    if (hasApiKey && !confirm("Isso irá revogar a chave atual. Continuar?")) return;
    setGeneratingKey(true);
    setNewApiKey(null);
    const r = await fetch("/api/agency/api-key", { method: "POST" });
    const d = await r.json();
    if (d.key) {
      setNewApiKey(d.key);
      setHasApiKey(true);
    }
    setGeneratingKey(false);
  }, [hasApiKey]);

  const copyKey = useCallback(() => {
    if (!newApiKey) return;
    navigator.clipboard.writeText(newApiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  }, [newApiKey]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const res = await fetch("/api/agency/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, logoUrl, primaryColor, webhookUrl, whatsappPhone, contractTemplate, pmTool, pmApiKey, pmApiKey2, pmListId }),
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

        {/* Contract */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Contrato digital</h2>
            <p className="text-xs text-slate-400 mt-1">
              Se preenchido, o cliente lerá e assinará o contrato antes de iniciar o onboarding. Assinatura eletrônica simples (Lei 14.063/2020).
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="contractTemplate" className="text-sm font-bold text-slate-700">
              Texto do contrato{" "}
              <span className="font-normal text-slate-400">(deixe em branco para desativar)</span>
            </label>
            <textarea
              id="contractTemplate"
              rows={10}
              value={contractTemplate}
              onChange={(e) => setContractTemplate(e.target.value)}
              placeholder={"CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nEntre [NOME DA AGÊNCIA] e o CONTRATANTE acima identificado...\n\nCláusula 1ª — ..."}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition resize-y font-mono leading-relaxed"
            />
            {contractTemplate && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Contrato ativo — os clientes assinarão antes de iniciar o onboarding.
              </div>
            )}
          </div>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">API pública</h2>
            <p className="text-xs text-slate-400 mt-1">
              Use a API key para integrar com Zapier, Make, CRMs ou qualquer sistema externo.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {newApiKey ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0">warning</span>
                  <p className="text-xs font-semibold text-amber-700">Copie agora — esta chave não será exibida novamente.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={newApiKey}
                    className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-mono text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={copyKey}
                    className="h-11 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">{keyCopied ? "check" : "content_copy"}</span>
                    {keyCopied ? "Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {hasApiKey && (
                  <div className="flex items-center gap-2 flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 px-3">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">key</span>
                    <span className="text-xs font-mono text-slate-500">vtx_••••••••••••••••••••••••••••••••</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleGenerateKey}
                  disabled={generatingKey}
                  className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 flex items-center gap-1.5 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">key</span>
                  {generatingKey ? "Gerando..." : hasApiKey ? "Regenerar chave" : "Gerar chave de API"}
                </button>
              </div>
            )}

            {/* Docs snippet */}
            <details className="group">
              <summary className="text-xs font-semibold text-slate-500 cursor-pointer select-none hover:text-slate-800 transition-colors list-none flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] group-open:rotate-90 transition-transform">chevron_right</span>
                Como usar a API
              </summary>
              <div className="mt-2 rounded-xl bg-slate-900 p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                <p className="text-slate-500"># Listar onboardings</p>
                <p>{`curl https://vertice.roilabs.com.br/api/v1/onboardings \\`}</p>
                <p>{`  -H "Authorization: Bearer vtx_SUA_CHAVE"`}</p>
                <br />
                <p className="text-slate-500"># Criar onboarding</p>
                <p>{`curl -X POST https://vertice.roilabs.com.br/api/v1/onboardings \\`}</p>
                <p>{`  -H "Authorization: Bearer vtx_SUA_CHAVE" \\`}</p>
                <p>{`  -H "Content-Type: application/json" \\`}</p>
                <p>{`  -d '{"clientName":"Empresa XYZ","email":"contato@xyz.com"}'`}</p>
              </div>
            </details>
          </div>
        </div>

        {/* Project Management */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Gerenciador de Projetos</h2>
            <p className="text-xs text-slate-400 mt-1">
              Ao concluir um onboarding, criamos automaticamente uma tarefa/card no seu sistema de gestão.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="pmTool" className="text-sm font-bold text-slate-700">Ferramenta</label>
            <select
              id="pmTool"
              value={pmTool}
              onChange={(e) => setPmTool(e.target.value)}
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
            >
              <option value="">Nenhuma (desativado)</option>
              <option value="clickup">ClickUp</option>
              <option value="notion">Notion</option>
              <option value="trello">Trello</option>
            </select>
          </div>

          {pmTool && (
            <>
              <div className="flex flex-col gap-2">
                <label htmlFor="pmApiKey" className="text-sm font-bold text-slate-700">
                  {pmTool === "clickup" && "API Token (Personal Token)"}
                  {pmTool === "notion" && "Integration Token"}
                  {pmTool === "trello" && "API Key"}
                </label>
                <input
                  id="pmApiKey"
                  type="password"
                  value={pmApiKey}
                  onChange={(e) => setPmApiKey(e.target.value)}
                  placeholder={pmTool === "clickup" ? "pk_xxxx..." : pmTool === "notion" ? "secret_xxxx..." : "xxxx..."}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition font-mono"
                />
              </div>

              {pmTool === "trello" && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="pmApiKey2" className="text-sm font-bold text-slate-700">Token</label>
                  <input
                    id="pmApiKey2"
                    type="password"
                    value={pmApiKey2}
                    onChange={(e) => setPmApiKey2(e.target.value)}
                    placeholder="xxxx..."
                    className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition font-mono"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="pmListId" className="text-sm font-bold text-slate-700">
                  {pmTool === "clickup" && "List ID"}
                  {pmTool === "notion" && "Database ID"}
                  {pmTool === "trello" && "List ID"}
                </label>
                <input
                  id="pmListId"
                  type="text"
                  value={pmListId}
                  onChange={(e) => setPmListId(e.target.value)}
                  placeholder={pmTool === "notion" ? "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" : "123456789"}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition font-mono"
                />
                <p className="text-xs text-slate-400">
                  {pmTool === "clickup" && "Abra a lista no ClickUp → URL contém /list/XXXXXXX"}
                  {pmTool === "notion" && "Abra o banco de dados → URL: notion.so/xxx?v=... → copie o ID de 32 chars"}
                  {pmTool === "trello" && "Via API: GET https://api.trello.com/1/boards/{boardId}/lists"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Automations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Automações</h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="whatsappPhone" className="text-sm font-bold text-slate-700">
              WhatsApp da agência{" "}
              <span className="font-normal text-slate-400">(notificações para a equipe)</span>
            </label>
            <input
              id="whatsappPhone"
              type="tel"
              value={whatsappPhone}
              onChange={(e) => setWhatsappPhone(e.target.value)}
              placeholder="11999999999"
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
            />
            <p className="text-xs text-slate-400">
              Apenas números (DDD + número). Exemplo: 11999999999
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="webhookUrl" className="text-sm font-bold text-slate-700">
              Webhook URL{" "}
              <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="webhookUrl"
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition"
            />
            <p className="text-xs text-slate-400">
              Receba um POST JSON nos eventos: <code className="bg-slate-100 px-1 rounded">onboarding.created</code>, <code className="bg-slate-100 px-1 rounded">onboarding.completed</code>
            </p>
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
