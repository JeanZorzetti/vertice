import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Integrações – Vértice",
  description: "Como o Vértice se conecta com as ferramentas que sua agência já usa.",
};

const integrations = [
  {
    icon: "folder",
    name: "Google Drive",
    desc: "Assets enviados pelo cliente — logo, manual de marca, fotos — vão direto para as pastas da sua agência, organizados por cliente. Nada de anexo perdido em e-mail.",
  },
  {
    icon: "chat",
    name: "Slack",
    desc: "Sua equipe recebe um aviso no canal certo assim que um cliente avança de etapa ou termina o onboarding — sem precisar ficar checando o painel.",
  },
  {
    icon: "hub",
    name: "HubSpot",
    desc: "Os dados que o cliente preenche no onboarding — empresa, contato, briefing — sincronizam com o CRM, sem digitação dupla pra sua equipe comercial.",
  },
  {
    icon: "task_alt",
    name: "Asana",
    desc: "Quando o onboarding é concluído, um projeto novo é criado automaticamente com as tarefas de kickoff, já com os dados do cliente preenchidos.",
  },
  {
    icon: "credit_card",
    name: "Stripe",
    desc: "Para agências que também gerenciam a conta de anúncios ou e-commerce do cliente, conecte o Stripe dele e acompanhe receita junto com o resto do onboarding.",
  },
];

export default function IntegracoesPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="pt-20 pb-16 lg:pt-28 lg:pb-20 bg-[#f8f9fc]">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
              Integra com o que você já usa
            </h1>
            <p className="text-lg text-[#4c669a] leading-relaxed">
              O Vértice não pede pra sua agência trocar de ferramenta — ele se conecta ao que já está
              em uso e tira o trabalho manual do meio.
            </p>
          </div>
        </section>

        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
            {integrations.map((i) => (
              <div
                key={i.name}
                className="flex gap-6 p-8 rounded-2xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]"
              >
                <div className="h-14 w-14 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#135bec] text-[28px]">{i.icon}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">{i.name}</h2>
                  <p className="text-[#4c669a] leading-relaxed">{i.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="text-[#4c669a] mb-6">Não achou a ferramenta que sua agência usa?</p>
            <Link href="/contato" className="text-[#135bec] font-bold hover:underline">
              Fale com a gente →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
