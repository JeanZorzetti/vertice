import type { Metadata } from "next";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export const metadata: Metadata = {
  title: "Termos de Uso – Vértice",
  description: "Condições de uso do Vértice.",
};

const sections = [
  {
    title: "1. Aceitação",
    body: "Ao criar uma conta ou usar o Vértice, você concorda com estes Termos de Uso e com a Política de Privacidade. Se você está criando a conta em nome de uma agência, declara ter autoridade para vinculá-la a estes termos.",
  },
  {
    title: "2. O que é o serviço",
    body: "O Vértice é um software como serviço (SaaS) que permite a agências criar portais de onboarding para seus clientes, com formulários, uploads, conexões de conta e cobranças automáticas de pendência.",
  },
  {
    title: "3. Conta e cadastro",
    body: "Você é responsável por manter a confidencialidade das credenciais de acesso da sua conta e por toda atividade realizada com elas. Avise imediatamente contato@vertice.app em caso de uso não autorizado.",
  },
  {
    title: "4. Planos e cobrança",
    body: "Oferecemos um período de teste de 14 dias, sem necessidade de cartão de crédito. Após o teste, o uso continuado exige assinatura de um dos planos pagos (Starter, Pro ou Agency), cobrada mensalmente. Você pode cancelar a qualquer momento; o cancelamento interrompe a cobrança seguinte e não gera reembolso proporcional do período já pago.",
  },
  {
    title: "5. Uso aceitável",
    body: "Você não pode usar o Vértice para armazenar ou transmitir conteúdo ilegal, para tentar acessar dados de outras agências sem autorização, ou para fazer engenharia reversa do produto. Reservamo-nos o direito de suspender contas que violem estas condições.",
  },
  {
    title: "6. Dados do cliente da agência",
    body: "Os dados inseridos por clientes finais durante o onboarding pertencem à agência que os coletou. O Vértice atua como operador desses dados, processando-os apenas conforme instruído pela agência para operar o serviço.",
  },
  {
    title: "7. Disponibilidade",
    body: "Empregamos esforços comerciais razoáveis para manter o serviço disponível, mas não garantimos operação ininterrupta. Janelas de manutenção e eventuais indisponibilidades serão comunicadas quando possível.",
  },
  {
    title: "8. Limitação de responsabilidade",
    body: "Na máxima extensão permitida por lei, o Vértice não se responsabiliza por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso do serviço, exceto em casos de dolo ou culpa grave.",
  },
  {
    title: "9. Rescisão",
    body: "Qualquer uma das partes pode encerrar a relação a qualquer momento. Após o encerramento, dados ficam disponíveis para exportação pelo prazo descrito na Política de Privacidade.",
  },
  {
    title: "10. Alterações destes termos",
    body: "Podemos atualizar estes termos conforme o produto evolui. Mudanças relevantes serão comunicadas por e-mail aos administradores de cada conta com antecedência razoável.",
  },
  {
    title: "11. Lei aplicável",
    body: "Estes termos são regidos pelas leis da República Federativa do Brasil.",
  },
  {
    title: "12. Contato",
    body: "Dúvidas sobre estes termos: contato@vertice.app.",
  },
];

export default function TermosPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-2">Termos de Uso</h1>
            <p className="text-sm text-[#4c669a] mb-12">Última atualização: 15 de agosto de 2026</p>

            <div className="space-y-8">
              {sections.map((s) => (
                <div key={s.title}>
                  <h2 className="text-xl font-bold mb-2">{s.title}</h2>
                  <p className="text-[#4c669a] leading-relaxed">{s.body}</p>
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
