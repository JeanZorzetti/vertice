import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Preços – Vértice",
  description: "Planos simples e transparentes para agências de qualquer tamanho.",
};

const plans = [
  {
    name: "Starter",
    price: "R$ 97",
    desc: "Para agências que estão começando",
    clients: "Até 5 clientes ativos",
    features: ["Portal white-label", "Magic links de onboarding", "Google Drive automático", "WhatsApp + e-mail"],
    cta: "Começar Trial",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$ 197",
    desc: "Para agências em crescimento",
    clients: "Até 20 clientes ativos",
    features: ["Tudo do Starter", "Análise com IA (Claude)", "Templates reutilizáveis", "Analytics avançado", "Webhooks customizáveis"],
    cta: "Começar Trial",
    highlight: true,
  },
  {
    name: "Agency",
    price: "R$ 397",
    desc: "Para agências estabelecidas",
    clients: "Clientes ilimitados",
    features: ["Tudo do Pro", "Clientes ilimitados", "Múltiplos usuários", "Suporte prioritário", "Onboarding dedicado"],
    cta: "Começar Trial",
    highlight: false,
  },
];

export default function PrecosPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Preço simples e transparente</h1>
              <p className="text-lg text-[#4c669a] max-w-2xl mx-auto">
                Comece com 14 dias grátis. Cancele quando quiser. Sem surpresas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 flex flex-col gap-6 relative ${plan.highlight ? "bg-[#135bec] text-white shadow-[0_24px_60px_-8px_rgba(19,91,236,0.4)]" : "bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]"}`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-white text-[#135bec] text-xs font-bold px-4 py-1.5 rounded-full shadow-md">Mais popular</span>
                    </div>
                  )}
                  <div>
                    <p className={`text-sm font-bold uppercase tracking-wide mb-1 ${plan.highlight ? "text-blue-200" : "text-[#4c669a]"}`}>{plan.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className={`text-sm ${plan.highlight ? "text-blue-200" : "text-[#4c669a]"}`}>/mês</span>
                    </div>
                    <p className={`text-sm mt-1 ${plan.highlight ? "text-blue-100" : "text-[#4c669a]"}`}>{plan.desc}</p>
                  </div>

                  <div className={`text-sm font-bold py-2 px-3 rounded-lg ${plan.highlight ? "bg-white/10 text-white" : "bg-blue-50 text-[#135bec]"}`}>
                    {plan.clients}
                  </div>

                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <span className={`material-symbols-outlined text-[16px] shrink-0 ${plan.highlight ? "text-blue-200" : "text-emerald-500"}`} style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        <span className={plan.highlight ? "text-blue-50" : "text-[#4c669a]"}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className={`mt-auto py-3 rounded-xl text-sm font-bold text-center transition-all ${plan.highlight ? "bg-white text-[#135bec] hover:bg-blue-50" : "bg-[#135bec] text-white hover:bg-[#0c3b9e]"}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-[#4c669a] mt-8">
              14 dias grátis · Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
