import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Política de Privacidade – Vértice",
  description: "Como o Vértice coleta, usa e protege dados pessoais.",
};

const sections: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "quem-somos",
    title: "1. Quem somos",
    body: "O Vértice (vertice.roilabs.com.br) é um produto de software que ajuda agências de marketing a automatizar o onboarding de novos clientes. Esta política explica que dados coletamos, de quem, e o que fazemos com eles.",
  },
  {
    id: "dados-que-coletamos",
    title: "2. Dados que coletamos",
    body: "Da agência que contrata o Vértice: nome, e-mail e dados de cobrança do responsável pela conta. Do cliente final da agência, durante o onboarding: nome, e-mail, e as respostas e arquivos enviados nos formulários criados pela agência. Se a agência conecta ferramentas externas (Google, Meta), coletamos apenas os tokens de acesso necessários para a integração funcionar — não os dados completos dessas contas.",
  },
  {
    id: "como-usamos-os-dados",
    title: "3. Como usamos os dados",
    body: "Para operar o produto: autenticar usuários, conduzir o fluxo de onboarding, enviar lembretes automáticos de pendência e gerar os resumos de análise disponíveis no plano Pro. Não vendemos dados pessoais a terceiros, nem os usamos para publicidade fora do Vértice.",
  },
  {
    id: "compartilhamento",
    title: "4. Compartilhamento com terceiros",
    body: "Usamos provedores de infraestrutura (hospedagem, banco de dados, envio de e-mail) que processam dados em nosso nome, sob contrato e apenas para operar o serviço. Integrações que a própria agência ativa (Google Drive) trocam dados diretamente com essas plataformas, conforme autorizado pela agência via OAuth. Para cobrança da sua assinatura Vértice, usamos o Stripe como processador de pagamento — ele recebe os dados de cobrança do responsável pela conta, não dados de clientes finais.",
  },
  {
    id: "retencao",
    title: "5. Retenção",
    body: "Mantemos os dados de uma conta enquanto ela estiver ativa. Após o cancelamento, dados de onboarding ficam retidos por até 90 dias para permitir reativação ou exportação, e depois são apagados, salvo obrigação legal de retenção.",
  },
  {
    id: "seus-direitos",
    title: "6. Seus direitos (LGPD)",
    body: "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade ou eliminação dos seus dados pessoais, conforme os artigos 17 a 22 da Lei Geral de Proteção de Dados (Lei 13.709/2018). Para exercer qualquer um desses direitos, escreva para contato@vertice.app.",
  },
  {
    id: "cookies",
    title: "7. Cookies",
    body: "Usamos cookies essenciais para manter sua sessão autenticada. Não usamos cookies de rastreamento publicitário de terceiros.",
  },
  {
    id: "seguranca",
    title: "8. Segurança",
    body: (
      <>
        Dados em trânsito são protegidos com TLS e credenciais de integração são armazenadas de forma
        criptografada. Mais detalhes na{" "}
        <Link href="/seguranca" className="text-primary hover:underline">
          página de Segurança
        </Link>
        .
      </>
    ),
  },
  {
    id: "alteracoes",
    title: "9. Alterações",
    body: "Podemos atualizar esta política conforme o produto evolui. Mudanças relevantes serão comunicadas por e-mail aos administradores de cada conta.",
  },
  {
    id: "contato",
    title: "10. Contato",
    body: "Dúvidas sobre privacidade: contato@vertice.app.",
  },
];

export default function PrivacidadePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-text-main">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">
              Política de Privacidade
            </h1>
            <p className="text-sm text-text-muted mb-8">Última atualização: 15 de agosto de 2026</p>

            <nav aria-label="Sumário" className="mb-12 border-y border-gray-100 py-4">
              <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-muted">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="hover:text-primary transition-colors">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-8">
              {sections.map((s) => (
                <div key={s.id}>
                  <h2 id={s.id} className="text-xl font-bold mb-2 scroll-mt-24">
                    {s.title}
                  </h2>
                  <p className="text-text-muted leading-relaxed">{s.body}</p>
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
