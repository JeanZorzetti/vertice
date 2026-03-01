import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import LoginForm from "./_components/LoginForm";

interface AgencyBranding {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
}

async function getAgencyBranding(): Promise<AgencyBranding | null> {
  const headerStore = await headers();
  const slug = headerStore.get("x-agency-slug");
  if (!slug) return null;

  const agency = await prisma.agency.findUnique({
    where: { slug },
    select: { name: true, logoUrl: true, primaryColor: true },
  });
  return agency;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [agency, { error }] = await Promise.all([
    getAgencyBranding(),
    searchParams,
  ]);

  const errorMessages: Record<string, string> = {
    token_missing: "Link inválido.",
    token_invalid: "Link inválido ou expirado.",
    token_used: "Este link já foi utilizado. Solicite um novo.",
    token_expired: "Link expirado. Solicite um novo.",
    server_error: "Erro interno. Tente novamente.",
  };

  const errorMessage = error ? (errorMessages[error] ?? "Ocorreu um erro.") : null;
  const color = agency?.primaryColor ?? "#135bec";

  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden bg-[#f6f6f8] font-sans text-slate-900 antialiased">
      {/* Left Branding Panel */}
      <div
        className="hidden lg:flex w-1/3 xl:w-5/12 relative flex-col justify-between overflow-hidden"
        style={{ backgroundColor: "#0d121b" }}
      >
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{ background: `linear-gradient(135deg, ${color} 0%, #0d121b 100%)` }}
        />

        <div className="relative z-10 p-12 flex flex-col h-full justify-between">
          {/* Agency Logo / Name */}
          <div className="flex items-center gap-3">
            {agency?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agency.logoUrl}
                alt={agency.name}
                className="h-10 w-auto object-contain max-w-[180px]"
              />
            ) : (
              <>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: color }}
                >
                  <span className="material-symbols-outlined text-white text-2xl">change_history</span>
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  {agency?.name ?? "Vértice"}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 text-white/90 max-w-md">
            <p className="text-2xl font-medium leading-relaxed">
              &ldquo;Marketing não é mais sobre o que você fabrica, mas sobre as histórias que você conta.&rdquo;
            </p>
            <p className="text-sm font-normal text-white/50 uppercase tracking-widest mt-2">— Seth Godin</p>
          </div>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-[#f6f6f8]">
        <div className="w-full max-w-[480px] flex flex-col gap-10">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-4">
            {agency?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={agency.logoUrl} alt={agency.name} className="h-9 w-auto object-contain max-w-[160px]" />
            ) : (
              <>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <span className="material-symbols-outlined text-white text-xl">change_history</span>
                </div>
                <span className="text-lg font-bold text-slate-900">{agency?.name ?? "Vértice"}</span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-slate-900 text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Bem-vindo ao seu onboarding
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              {agency
                ? `Digite seu e-mail para acessar o portal da ${agency.name}.`
                : "Digite o e-mail associado à sua conta para receber o link de acesso."}
            </p>
          </div>

          <LoginForm agency={agency} error={errorMessage} />
        </div>
      </div>
    </div>
  );
}
