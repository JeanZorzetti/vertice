import type { Metadata } from "next";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Vagas – Vértice",
  description: "Vagas abertas no Vértice e como se candidatar espontaneamente.",
};

const futureAreas = [
  { title: "Engenharia de Produto", desc: "Full-stack, foco em fluxos de onboarding, integrações e automação." },
  { title: "Sucesso do Cliente", desc: "Ajudar agências a implantar o Vértice e tirar o máximo do produto." },
  { title: "Marketing & Conteúdo", desc: "Contar a história de agências que saíram do caos com onboarding automatizado." },
];

export default function VagasPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">Vagas</h1>
            <p className="text-lg text-[#4c669a] leading-relaxed mb-4">
              Não temos vagas abertas no momento. O Vértice ainda é um time pequeno, e preferimos
              contratar quando existe uma necessidade real — não pra preencher um quadro.
            </p>
            <p className="text-lg text-[#4c669a] leading-relaxed mb-12">
              Se você quer trabalhar com onboarding, automação e produto para agências, pode mandar
              uma candidatura espontânea para{" "}
              <a href="mailto:contato@vertice.app" className="text-[#135bec] font-semibold hover:underline">
                contato@vertice.app
              </a>{" "}
              contando o que você faz e por que topa esse tipo de produto. Guardamos pra quando abrirmos vaga.
            </p>

            <h2 className="text-sm font-bold uppercase tracking-wide text-[#4c669a] mb-6">
              Áreas que devem crescer primeiro
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {futureAreas.map((a) => (
                <div key={a.title} className="rounded-2xl border border-gray-100 p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]">
                  <h3 className="font-bold text-[#0d121b] mb-2">{a.title}</h3>
                  <p className="text-sm text-[#4c669a]">{a.desc}</p>
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
