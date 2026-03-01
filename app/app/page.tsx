import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#135bec]/10">
              <span className="material-symbols-outlined text-[#135bec] text-[24px]">pentagon</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0d121b]">Vértice</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium text-[#4c669a] hover:text-[#135bec] transition-colors" href="#features">Funcionalidades</a>
            <a className="text-sm font-medium text-[#4c669a] hover:text-[#135bec] transition-colors" href="#pricing">Preços</a>
            <a className="text-sm font-medium text-[#4c669a] hover:text-[#135bec] transition-colors" href="#integrations">Integrações</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:flex h-9 items-center justify-center rounded-lg px-4 text-sm font-semibold text-[#4c669a] hover:text-[#135bec] transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              className="flex h-9 items-center justify-center rounded-lg bg-[#135bec] px-4 text-sm font-bold text-white transition-all hover:bg-[#0c3b9e] hover:-translate-y-0.5 shadow-[0_4px_24px_-2px_rgba(19,91,236,0.2)]"
            >
              Começar Grátis
            </Link>
          </div>
        </div>
      </header>

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
              <button className="w-full sm:w-auto h-12 px-8 rounded-lg border border-gray-200 bg-white font-semibold text-base hover:border-[#135bec]/30 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                Agendar Demo
              </button>
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

        {/* Integrations */}
        <section id="integrations" className="py-12 border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-semibold text-[#4c669a] mb-8 uppercase tracking-wider">
              Integra perfeitamente com as ferramentas que você já usa
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              {["Google Drive", "Slack", "HubSpot", "Asana", "Stripe"].map((tool) => (
                <span key={tool} className="text-lg font-semibold text-gray-500 cursor-pointer hover:text-[#0d121b] transition-colors">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 bg-[#f8f9fc]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Tudo que você precisa para crescer</h2>
              <p className="text-lg text-[#4c669a] max-w-2xl mx-auto">
                Chega de planilhas e correntes de e-mail. O Vértice é a central de comando para cada novo cliente da sua agência.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: "rocket_launch", title: "Portais Instantâneos", desc: "Gere um portal de onboarding com a sua marca em um clique. Dê ao cliente um único link para tudo." },
                { icon: "checklist", title: "Checklists Inteligentes", desc: "Formulários dinâmicos que se adaptam às respostas do cliente. Pergunte só o que você realmente precisa." },
                { icon: "notifications_active", title: "Cobranças Automáticas", desc: "O sistema avisa o cliente sobre pendências para você não precisar ficar no WhatsApp atrás de arquivo." },
              ].map((f) => (
                <div key={f.title} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-[#135bec] text-[28px]">{f.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-[#4c669a] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* Pricing */}
        <section id="pricing" className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Preço simples e transparente</h2>
              <p className="text-lg text-[#4c669a] max-w-2xl mx-auto">
                Comece com 14 dias grátis. Cancele quando quiser. Sem surpresas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
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
              ].map((plan) => (
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-6 items-center justify-center rounded bg-[#135bec]/10">
                  <span className="material-symbols-outlined text-[#135bec] text-[18px]">pentagon</span>
                </div>
                <span className="text-lg font-bold">Vértice</span>
              </div>
              <p className="text-[#4c669a] text-sm max-w-xs">
                Ajudando agências a fazer onboarding mais rápido, melhor e sem caos.
              </p>
            </div>
            {[
              { title: "Produto", links: ["Funcionalidades", "Integrações", "Preços", "Novidades"] },
              { title: "Empresa", links: ["Sobre nós", "Vagas", "Blog", "Contato"] },
              { title: "Legal", links: ["Política de Privacidade", "Termos de Uso", "Segurança"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold mb-4">{col.title}</h4>
                <ul className="space-y-3 text-sm text-[#4c669a]">
                  {col.links.map((link) => (
                    <li key={link}><a className="hover:text-[#135bec]" href="#">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-8">
            <p className="text-sm text-[#4c669a]">© 2025 Vértice. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
