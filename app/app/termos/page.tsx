import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Termos de Uso – Vértice",
  description: "Condições de uso do Vértice.",
};

const sections: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "aceitacao",
    title: "1. Aceitação",
    body: (
      <>
        Ao criar uma conta ou usar o Vértice, você concorda com estes Termos de Uso e com a{" "}
        <Link href="/privacidade" className="text-primary hover:underline">
          Política de Privacidade
        </Link>
        . Se você está criando a conta em nome de uma agência, declara ter autoridade para vinculá-la a
        estes termos.
      </>
    ),
  },
  {
    id: "servico",
    title: "2. O que é o serviço",
    body: "O Vértice é um software como serviço (SaaS) que permite a agências criar portais de onboarding para seus clientes, com formulários, uploads, conexões de conta e cobranças automáticas de pendência.",
  },
  {
    id: "conta-e-cadastro",
    title: "3. Conta e cadastro",
    body: "Você é responsável por manter a confidencialidade das credenciais de acesso da sua conta e por toda atividade realizada com elas. Avise imediatamente contato@vertice.app em caso de uso não autorizado.",
  },
  {
    id: "planos-e-cobranca",
    title: "4. Planos e cobrança",
    body: "Oferecemos um período de teste de 14 dias, sem necessidade de cartão de crédito. Após o teste, o uso continuado exige assinatura de um dos planos pagos (Starter, Pro ou Agency), cobrada mensalmente. Você pode cancelar a qualquer momento; o cancelamento interrompe a cobrança seguinte e não gera reembolso proporcional do período já pago.",
  },
  {
    id: "uso-aceitavel",
    title: "5. Uso aceitável",
    body: "Você não pode usar o Vértice para armazenar ou transmitir conteúdo ilegal, para tentar acessar dados de outras agências sem autorização, ou para fazer engenharia reversa do produto. Reservamo-nos o direito de suspender contas que violem estas condições.",
  },
  {
    id: "dados-do-cliente",
    title: "6. Dados do cliente da agência",
    body: "Os dados inseridos por clientes finais durante o onboarding pertencem à agência que os coletou. O Vértice atua como operador desses dados, processando-os apenas conforme instruído pela agência para operar o serviço.",
  },
  {
    id: "disponibilidade",
    title: "7. Disponibilidade",
    body: "Empregamos esforços comerciais razoáveis para manter o serviço disponível, mas não garantimos operação ininterrupta. Janelas de manutenção e eventuais indisponibilidades serão comunicadas quando possível.",
  },
  {
    id: "limitacao-de-responsabilidade",
    title: "8. Limitação de responsabilidade",
    body: "Na máxima extensão permitida por lei, o Vértice não se responsabiliza por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso do serviço, exceto em casos de dolo ou culpa grave.",
  },
  {
    id: "rescisao",
    title: "9. Rescisão",
    body: (
      <>
        Qualquer uma das partes pode encerrar a relação a qualquer momento. Após o encerramento, dados
        ficam disponíveis para exportação pelo prazo descrito na{" "}
        <Link href="/privacidade" className="text-primary hover:underline">
          Política de Privacidade
        </Link>
        .
      </>
    ),
  },
  {
    id: "alteracoes",
    title: "10. Alterações destes termos",
    body: "Podemos atualizar estes termos conforme o produto evolui. Mudanças relevantes serão comunicadas por e-mail aos administradores de cada conta com antecedência razoável.",
  },
  {
    id: "lei-aplicavel",
    title: "11. Lei aplicável",
    body: "Estes termos são regidos pelas leis da República Federativa do Brasil.",
  },
  {
    id: "contato",
    title: "12. Contato",
    body: "Dúvidas sobre estes termos: contato@vertice.app.",
  },
];

export default function TermosPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-text-main">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">Termos de Uso</h1>
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
