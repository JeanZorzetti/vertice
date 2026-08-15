import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Funcionalidades – Vértice",
  description: "Tudo que o Vértice automatiza no onboarding de clientes de uma agência.",
};

const mainFeatures = [
  { icon: "rocket_launch", title: "Portais Instantâneos", desc: "Gere um portal de onboarding com a sua marca em um clique. Dê ao cliente um único link para tudo." },
  { icon: "checklist", title: "Checklists Inteligentes", desc: "Formulários dinâmicos que se adaptam às respostas do cliente. Pergunte só o que você realmente precisa." },
  { icon: "notifications_active", title: "Cobranças Automáticas", desc: "O sistema avisa o cliente sobre pendências para você não precisar ficar no WhatsApp atrás de arquivo." },
];

const moreFeatures = [
  { icon: "link", title: "Magic link, sem senha", desc: "O cliente acessa pelo e-mail — nenhuma senha nova para criar ou esquecer." },
  { icon: "cloud_upload", title: "Upload direto pra pasta certa", desc: "Assets sobem direto para a organização da sua agência, sem e-mail de anexo." },
  { icon: "vpn_key", title: "Conexões via OAuth", desc: "Cliente conecta contas do Google e Meta sem nunca digitar uma senha pra você." },
  { icon: "save", title: "Auto-save", desc: "Se o cliente fechar a aba no meio do caminho, ele retoma exatamente de onde parou." },
  { icon: "dashboard", title: "Painel com progresso por cliente", desc: "Veja em qual etapa cada onboarding está travado, sem precisar perguntar." },
  { icon: "auto_awesome", title: "Briefing processado por IA", desc: "O briefing estratégico vira um documento de tom de voz e personas pronto pra equipe." },
];

export default function FuncionalidadesPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="pt-20 pb-16 lg:pt-28 lg:pb-20 bg-[#f8f9fc]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
              Tudo que você precisa para crescer
            </h1>
            <p className="text-lg text-[#4c669a] leading-relaxed">
              Chega de planilhas e correntes de e-mail. O Vértice é a central de comando para cada novo
              cliente da sua agência.
            </p>
          </div>
        </section>

        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {mainFeatures.map((f) => (
                <div key={f.title} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[#135bec] text-[28px]">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-[#4c669a] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-center mb-10">E mais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreFeatures.map((f) => (
                <div key={f.title} className="flex gap-4 p-6 rounded-2xl border border-gray-100">
                  <div className="h-10 w-10 shrink-0 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#135bec] text-[20px]">{f.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0d121b] mb-1">{f.title}</h3>
                    <p className="text-sm text-[#4c669a]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-16">
              <Link
                href="/signup"
                className="inline-flex h-12 px-8 items-center justify-center rounded-lg bg-[#135bec] text-white font-bold text-base shadow-[0_4px_24px_-2px_rgba(19,91,236,0.2)] hover:bg-[#0c3b9e] transition-all hover:-translate-y-1"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
