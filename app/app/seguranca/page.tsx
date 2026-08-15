import type { Metadata } from "next";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Segurança – Vértice",
  description: "Como o Vértice protege os dados da sua agência e dos seus clientes.",
};

const practices = [
  {
    icon: "lock",
    title: "Criptografia em trânsito",
    desc: "Toda comunicação com o Vértice usa HTTPS/TLS, incluindo os portais de onboarding dos seus clientes.",
  },
  {
    icon: "vpn_key",
    title: "OAuth 2.0 nas integrações",
    desc: "Conexões com Google, Meta, HubSpot, Slack e Asana usam OAuth 2.0. O Vértice nunca armazena a senha da sua conta nessas plataformas — só o token de acesso, revogável a qualquer momento.",
  },
  {
    icon: "domain",
    title: "Isolamento por agência",
    desc: "Cada agência opera em um espaço isolado dentro do banco de dados. Uma conta nunca enxerga dados de onboarding de outra agência.",
  },
  {
    icon: "backup",
    title: "Backups",
    desc: "O banco de dados de produção passa por backups automáticos regulares, permitindo restauração em caso de falha de infraestrutura.",
  },
  {
    icon: "admin_panel_settings",
    title: "Controle de acesso",
    desc: "Acesso à infraestrutura de produção é restrito à equipe responsável pela operação do serviço, com autenticação individual — sem credenciais compartilhadas.",
  },
  {
    icon: "bug_report",
    title: "Divulgação responsável",
    desc: "Encontrou uma vulnerabilidade? Reporte para contato@vertice.app antes de divulgar publicamente. Levamos todo relato a sério e respondemos diretamente.",
  },
];

export default function SegurancaPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Segurança</h1>
              <p className="text-lg text-[#4c669a] max-w-xl mx-auto">
                Os dados que passam pelo onboarding — arquivos, credenciais de anúncio, informações de
                cliente — são sensíveis. Assim tratamos isso.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {practices.map((p) => (
                <div key={p.title} className="rounded-2xl border border-gray-100 p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-[#135bec] text-[24px]">{p.icon}</span>
                  </div>
                  <h3 className="font-bold text-[#0d121b] mb-2">{p.title}</h3>
                  <p className="text-sm text-[#4c669a] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
