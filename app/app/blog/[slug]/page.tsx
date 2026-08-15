import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";
import { getPost, posts } from "../posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return { title: `${post.title} – Vértice`, description: post.excerpt };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <article className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <Link href="/blog" className="text-sm font-semibold text-[#135bec] hover:underline mb-8 inline-block">
              ← Blog
            </Link>

            <p className="text-sm font-semibold text-[#4c669a] uppercase tracking-wide mb-3">
              {new Date(post.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} · {post.readTime} de leitura
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-10">{post.title}</h1>

            <div className="space-y-6 text-lg text-[#4c669a] leading-relaxed">
              <p>
                O contrato foi assinado. Do lado da agência, é motivo de comemoração. Do lado do
                cliente, é o início de uma dúvida silenciosa: <em>será que eu tomei a decisão certa?</em>
              </p>
              <p>
                O onboarding é quem responde essa pergunta — e na maioria das agências, ele responde
                errado. Não porque o trabalho criativo ou estratégico seja ruim, mas porque o começo da
                relação é feito de dezenas de e-mails e áudios de WhatsApp pedindo arquivo, planilhas com
                senha do Google e do Meta circulando em texto puro, e um setup interno manual — pasta no
                Drive, projeto no ClickUp, grupo de comunicação — que ninguém sabe ao certo se já foi
                feito. A agência não tem visibilidade de onde cada cliente está travado, e o cliente sente
                que virou só mais um número numa fila de tarefas.
              </p>
              <p>
                O resultado é sempre o mesmo: o cliente forma sua primeira impressão da agência antes de
                ver qualquer resultado de marketing. E essa impressão é <strong className="text-[#0d121b]">caos</strong>.
              </p>

              <h2 className="text-2xl font-bold text-[#0d121b] pt-4">O que muda com um portal guiado</h2>
              <p>
                A ideia por trás do Vértice é simples: em vez de reinventar o processo a cada cliente
                novo, a agência monta o fluxo uma única vez — dados da empresa, upload de assets, conexão
                de contas, briefing estratégico — e envia um único link. O cliente entra com magic link,
                sem senha nova pra lembrar, e percorre uma experiência guiada que sabe exatamente o que já
                foi preenchido e o que falta.
              </p>
              <p>
                Do outro lado, a agência ganha o que faltava: visibilidade. Um painel mostra em qual etapa
                cada cliente está, avisa quando alguém fica parado por dias, e organiza os arquivos
                recebidos direto na estrutura de pastas de sempre — sem ninguém precisar renomear anexo de
                e-mail.
              </p>

              <h2 className="text-2xl font-bold text-[#0d121b] pt-4">Por que isso importa mais do que parece</h2>
              <p>
                Onboarding bem feito não é sobre economizar uma hora de trabalho manual — embora economize.
                É sobre a diferença entre um cliente que começa a relação organizado e confiante, e um que
                começa apagando incêndio e duvidando da escolha que fez. O primeiro contato define o resto.
              </p>
              <p>
                Se sua agência ainda faz esse processo por e-mail e planilha,{" "}
                <Link href="/contato" className="text-[#135bec] font-semibold hover:underline">
                  fala com a gente
                </Link>{" "}
                ou{" "}
                <Link href="/signup" className="text-[#135bec] font-semibold hover:underline">
                  comece um trial grátis
                </Link>{" "}
                de 14 dias.
              </p>
            </div>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
