import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Contato – Vértice",
  description: "Fale com o time do Vértice.",
};

const channels = [
  {
    icon: "mail",
    title: "E-mail",
    desc: "Para dúvidas, suporte ou parcerias.",
    action: "contato@vertice.app",
    href: "mailto:contato@vertice.app",
  },
  {
    icon: "rocket_launch",
    title: "Testar o produto",
    desc: "14 dias grátis, sem cartão de crédito.",
    action: "Começar trial",
    href: "/signup",
  },
  {
    icon: "login",
    title: "Já é cliente?",
    desc: "Acesse o painel da sua agência.",
    action: "Entrar",
    href: "/login",
  },
];

export default function ContatoPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Fale com a gente</h1>
            <p className="text-lg text-[#4c669a] max-w-xl mx-auto mb-16">
              Time pequeno, resposta direta — sem central de atendimento automatizada.
            </p>
          </div>

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {channels.map((c) => (
              <div key={c.title} className="rounded-2xl border border-gray-100 p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] flex flex-col">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[#135bec] text-[24px]">{c.icon}</span>
                </div>
                <h3 className="font-bold text-[#0d121b] mb-1">{c.title}</h3>
                <p className="text-sm text-[#4c669a] mb-4 flex-grow">{c.desc}</p>
                <Link href={c.href} className="text-sm font-bold text-[#135bec] hover:underline">
                  {c.action} →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
