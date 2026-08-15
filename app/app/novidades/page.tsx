import type { Metadata } from "next";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Novidades – Vértice",
  description: "O que mudou no Vértice: novas funcionalidades, melhorias e correções.",
};

const releases = [
  {
    date: "Agosto 2026",
    tag: "Novo",
    title: "Formulários Inteligentes 2.0",
    desc: "Os formulários de onboarding agora se adaptam em tempo real às respostas do cliente, pulando perguntas que não fazem sentido para o setor ou plano dele. Menos atrito, menos abandono no meio do preenchimento.",
  },
  {
    date: "Junho 2026",
    tag: "Novo",
    title: "Análise com IA (Claude)",
    desc: "No plano Pro, cada onboarding concluído gera um resumo automático: o que foi entregue, o que ainda está pendente e riscos identificados nas respostas do cliente — pronto para colar no relatório da conta.",
  },
  {
    date: "Abril 2026",
    tag: "Melhoria",
    title: "Webhooks customizáveis",
    desc: "Dispare eventos de onboarding (criado, etapa concluída, finalizado) para qualquer endpoint. Já dá pra plugar no Slack, num CRM interno ou numa automação no n8n/Zapier.",
  },
  {
    date: "Fevereiro 2026",
    tag: "Melhoria",
    title: "Cobranças automáticas de pendência",
    desc: "Quando um cliente deixa um upload ou uma resposta pendente, o Vértice agora reenvia lembretes automaticamente por e-mail antes de qualquer humano precisar cutucar no WhatsApp.",
  },
  {
    date: "Dezembro 2025",
    tag: "Lançamento",
    title: "Portais Instantâneos",
    desc: "Cada novo cliente ganha um portal com a marca da sua agência, gerado em um clique a partir de um template reutilizável.",
  },
];

const tagColor: Record<string, string> = {
  Novo: "bg-[#135bec]/10 text-[#135bec]",
  Melhoria: "bg-emerald-50 text-emerald-600",
  Lançamento: "bg-purple-50 text-purple-600",
};

export default function NovidadesPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Novidades</h1>
              <p className="text-lg text-[#4c669a] max-w-xl mx-auto">
                O que estamos construindo para tirar mais caos do onboarding da sua agência.
              </p>
            </div>

            <div className="space-y-10">
              {releases.map((r) => (
                <article key={r.title} className="flex gap-6 border-b border-gray-100 pb-10 last:border-0">
                  <div className="w-28 shrink-0 pt-1 text-sm font-semibold text-[#4c669a]">{r.date}</div>
                  <div>
                    <span className={`inline-block mb-2 rounded-full px-2.5 py-0.5 text-xs font-bold ${tagColor[r.tag]}`}>{r.tag}</span>
                    <h2 className="text-xl font-bold mb-2">{r.title}</h2>
                    <p className="text-[#4c669a] leading-relaxed">{r.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
