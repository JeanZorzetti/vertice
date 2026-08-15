import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#135bec]/5 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-100 rounded-full blur-3xl opacity-60"></div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#135bec]/5 px-3 py-1 mb-8 border border-[#135bec]/10">
              <span className="flex h-2 w-2 rounded-full bg-[#135bec] animate-pulse"></span>
              <span className="text-xs font-semibold text-[#135bec] uppercase tracking-wide">Novidade: Formulários Inteligentes 2.0</span>
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Acabe com o Caos do Onboarding.{" "}
              <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#135bec] to-purple-600">
                Entregue Mais Rápido.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-lg text-[#4c669a] mb-10 leading-relaxed">
              Automatize o onboarding da sua agência, elimine follow-ups manuais e impressione novos clientes desde o primeiro dia com um portal com a sua marca.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link
                href="/signup"
                className="w-full sm:w-auto h-12 px-8 rounded-lg bg-[#135bec] text-white font-bold text-base shadow-[0_4px_24px_-2px_rgba(19,91,236,0.2)] hover:bg-[#0c3b9e] transition-all hover:-translate-y-1 flex items-center justify-center"
              >
                Começar Grátis
              </Link>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#135bec] to-purple-600 rounded-2xl blur opacity-20"></div>
              <div className="relative rounded-2xl bg-white border border-gray-100 shadow-2xl overflow-hidden aspect-[16/10]">
                <div className="absolute inset-0 bg-[#f8f9fc] flex flex-col">
                  <div className="h-14 border-b border-gray-100 bg-white flex items-center px-6 justify-between shrink-0">
                    <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                  </div>
                  <div className="flex-1 p-6 grid grid-cols-12 gap-4 overflow-hidden">
                    <div className="hidden md:flex col-span-2 flex-col gap-2">
                      <div className="h-8 w-full bg-[#135bec]/10 rounded"></div>
                      <div className="h-8 w-full bg-white rounded"></div>
                      <div className="h-8 w-full bg-white rounded"></div>
                      <div className="h-8 w-full bg-white rounded"></div>
                    </div>
                    <div className="col-span-12 md:col-span-10 flex flex-col gap-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="h-3 w-28 bg-gray-200 rounded mb-2"></div>
                          <div className="h-7 w-56 bg-gray-800 rounded"></div>
                        </div>
                        <div className="h-9 w-28 bg-[#135bec] rounded shadow-[0_4px_16px_-2px_rgba(19,91,236,0.3)]"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { icon: "check", bg: "bg-green-100", color: "text-green-600" },
                          { icon: "timelapse", bg: "bg-blue-100", color: "text-blue-600" },
                          { icon: "group", bg: "bg-purple-100", color: "text-purple-600" },
                        ].map((card, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className={`h-7 w-7 rounded ${card.bg} mb-2 flex items-center justify-center ${card.color}`}>
                              <span className="material-symbols-outlined text-sm">{card.icon}</span>
                            </div>
                            <div className="h-3 w-16 bg-gray-200 rounded mb-1.5"></div>
                            <div className="h-5 w-10 bg-gray-800 rounded"></div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-1 overflow-hidden flex flex-col">
                        <div className="h-10 border-b border-gray-50 flex items-center px-4 gap-4 shrink-0">
                          <div className="h-3 w-3 bg-gray-200 rounded"></div>
                          <div className="h-3 w-28 bg-gray-200 rounded"></div>
                          <div className="h-3 w-20 bg-gray-200 rounded ml-auto"></div>
                        </div>
                        <div className="p-3 space-y-3">
                          {["w-44", "w-36", "w-52"].map((w, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="h-7 w-7 rounded-full bg-gray-100 shrink-0"></div>
                              <div className={`h-3 ${w} bg-gray-100 rounded`}></div>
                              <div className={`ml-auto h-5 w-16 ${i === 0 ? "bg-green-100" : i === 1 ? "bg-yellow-100" : "bg-gray-100"} rounded-full`}></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Links para páginas dedicadas */}
        <section className="py-16 border-t border-gray-100 bg-[#f8f9fc]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { href: "/funcionalidades", icon: "rocket_launch", title: "Funcionalidades", desc: "O que o Vértice automatiza no onboarding de cada cliente novo." },
              { href: "/precos", icon: "sell", title: "Preços", desc: "Planos simples, 14 dias grátis, sem cartão de crédito." },
              { href: "/integracoes", icon: "hub", title: "Integrações", desc: "Google Drive, Slack, HubSpot, Asana e Stripe, conectados ao fluxo." },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg hover:-translate-y-1 transition-all"
              >
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[#135bec] text-[28px]">{c.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{c.title}</h3>
                <p className="text-[#4c669a] leading-relaxed">{c.desc}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
