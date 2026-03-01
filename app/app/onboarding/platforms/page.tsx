import Link from "next/link";

const platforms = [
  {
    name: "Meta Business Suite",
    desc: "Gerencie anúncios do Facebook e Instagram, insights e dados de audiência.",
    iconBg: "bg-[#1877F2]/10",
    icon: "meta",
    connected: true,
    authMethod: "OAuth 2.0 Seguro",
  },
  {
    name: "Google Ads",
    desc: "Acompanhe performance de anúncios, ROI e métricas de palavras-chave na rede Google.",
    iconBg: "bg-white border border-slate-100",
    icon: "google",
    connected: true,
    authMethod: "OAuth 2.0 Seguro",
  },
  {
    name: "Google Analytics 4",
    desc: "Entenda o comportamento dos usuários, fontes de tráfego e funis de conversão.",
    iconBg: "bg-[#FFF4E6]",
    icon: "analytics",
    connected: false,
    authMethod: "OAuth 2.0 Seguro",
  },
  {
    name: "WordPress",
    desc: "Sincronize posts do blog, landing pages e formulários de captação de leads.",
    iconBg: "bg-[#21759B]/10",
    icon: "wordpress",
    connected: false,
    authMethod: "Chave de API Necessária",
  },
];

const platformIcons: Record<string, string> = {
  meta: "M",
  google: "G",
  analytics: "A",
  wordpress: "W",
};

export default function PlatformsPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f6f8] font-sans text-slate-900 antialiased">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-10 py-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-[#135bec] text-4xl">change_history</span>
          <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight">Vértice Marketing</h2>
        </div>

        <div className="flex flex-1 justify-end gap-8 items-center">
          <div className="hidden lg:flex items-center gap-9">
            {["Painel", "Campanhas", "Integrações", "Configurações"].map((item) => (
              <a key={item} className="text-slate-600 hover:text-[#135bec] text-sm font-medium transition-colors" href="#">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center rounded-full size-10 hover:bg-slate-100 text-slate-600 transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="size-10 rounded-full bg-[#135bec]/20 flex items-center justify-center text-[#135bec] font-bold text-sm ring-2 ring-[#135bec]/20">
              AM
            </div>
          </div>
        </div>
      </header>

      <main className="flex h-full grow flex-col py-10 px-6 sm:px-10 lg:px-40">
        <div className="flex flex-col max-w-[1200px] w-full mx-auto flex-1 gap-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <a className="hover:text-[#135bec] transition-colors" href="#">Onboarding</a>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <a className="hover:text-[#135bec] transition-colors" href="#">Configuração</a>
            <span className="material-symbols-outlined text-base">chevron_right</span>
            <span className="text-[#135bec] font-bold">Conectar Plataformas</span>
          </nav>

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-slate-200">
            <div className="flex flex-col gap-2 max-w-2xl">
              <h1 className="text-slate-900 text-3xl md:text-4xl font-black leading-tight tracking-tight">
                Conecte suas plataformas
              </h1>
              <p className="text-slate-600 text-lg">
                Vincule suas contas de marketing para ativar relatórios automáticos e analytics em tempo real.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <span className="material-symbols-outlined text-lg">info</span>
              <span>Dados criptografados com segurança</span>
            </div>
          </div>

          {/* Integration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="group flex flex-col justify-between gap-6 rounded-xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-[#135bec]/30 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className={`size-14 rounded-lg ${platform.iconBg} flex items-center justify-center shrink-0`}>
                    <span className="text-xl font-black text-slate-700">{platformIcons[platform.icon]}</span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-slate-900 text-lg font-bold">{platform.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{platform.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {platform.connected ? (
                    <>
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-semibold">
                        <span className="material-symbols-outlined text-lg">check_circle</span>
                        <span>Conectado</span>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex items-center gap-2 bg-[#135bec] hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto justify-center">
                        <span className="material-symbols-outlined text-lg">add_link</span>
                        <span>Conectar Conta</span>
                      </button>
                      <span className="hidden sm:block text-xs font-medium text-slate-400">{platform.authMethod}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action */}
          <div className="flex items-center justify-between mt-4 pt-6 border-t border-slate-200">
            <Link
              href="/onboarding/brand-assets"
              className="px-6 py-3 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors"
            >
              Voltar
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              <span>Ir para o Painel</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
