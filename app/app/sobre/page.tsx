import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Sobre nós – Vértice",
  description: "Por que existimos e o que estamos construindo para agências de marketing.",
};

export default function SobrePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-8">Sobre o Vértice</h1>

            <div className="prose-none space-y-6 text-lg text-[#4c669a] leading-relaxed">
              <p>
                Toda agência que já cresceu um pouco conhece o mesmo problema: o trabalho criativo e
                estratégico é ótimo, mas o <strong className="text-[#0d121b]">início</strong> de cada conta
                novo cliente vira uma sequência de e-mails perdidos, planilhas desatualizadas e
                mensagens de WhatsApp cobrando um arquivo que já foi pedido três vezes.
              </p>
              <p>
                O Vértice existe para tirar esse trabalho manual do caminho. Em vez de reinventar o
                processo de onboarding a cada cliente novo, a agência monta o fluxo uma vez — formulários,
                uploads, conexões de conta — e o sistema conduz cada cliente por ele sozinho, com cobranças
                automáticas para quem fica pra trás.
              </p>
              <p>
                Não vendemos mais um painel genérico de projetos. O produto é feito especificamente para o
                primeiro contato entre uma agência e um cliente novo: aquele momento que define se a relação
                começa organizada ou já nasce apagando incêndio.
              </p>
              <p>
                Estamos em fase de crescimento inicial, construindo em cima do que agências reais nos
                contam que falta. Se você usa (ou pensa em usar) o Vértice e tem algo pra apontar,{" "}
                <Link href="/contato" className="text-[#135bec] font-semibold hover:underline">
                  fale com a gente
                </Link>
                .
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: "Foco", desc: "Um produto para um problema: o onboarding de clientes em agências." },
                { title: "Construção contínua", desc: "Funcionalidades nascem de pedidos reais de quem usa, não de roadmap fechado." },
                { title: "Sem caos escondido", desc: "O que automatizamos pra você, mostramos como funciona — sem caixa-preta." },
              ].map((v) => (
                <div key={v.title} className="rounded-2xl border border-gray-100 p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                  <h3 className="font-bold text-[#0d121b] mb-2">{v.title}</h3>
                  <p className="text-sm text-[#4c669a]">{v.desc}</p>
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
