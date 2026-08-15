import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Blog – Vértice",
  description: "Onboarding de clientes, automação e operação de agências.",
};

const topics = [
  { icon: "checklist", title: "Processo de onboarding", desc: "Como estruturar o início de cada conta nova sem depender de memória ou planilha." },
  { icon: "hub", title: "Integrações", desc: "Conectando Google, Meta, HubSpot e outras ferramentas sem virar um projeto de TI." },
  { icon: "trending_up", title: "Operação de agência", desc: "O que separa agências que escalam sem contratar um exército de operações." },
];

export default function BlogPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Blog</h1>
            <p className="text-lg text-[#4c669a] max-w-xl mx-auto mb-4">
              Ainda não publicamos o primeiro texto — estamos priorizando o produto antes do conteúdo.
              Quando sair, vai ser sobre o que realmente resolve o dia a dia de quem roda onboarding de
              clientes numa agência:
            </p>
          </div>

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {topics.map((t) => (
              <div key={t.title} className="rounded-2xl border border-gray-100 p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#135bec] text-[24px]">{t.icon}</span>
                </div>
                <h3 className="font-bold text-[#0d121b] mb-2">{t.title}</h3>
                <p className="text-sm text-[#4c669a]">{t.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-[#4c669a]">
            Quer ser avisado quando publicarmos?{" "}
            <Link href="/contato" className="text-[#135bec] font-semibold hover:underline">
              Fale com a gente
            </Link>
            .
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
