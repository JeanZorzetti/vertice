import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow flex items-center">
        <section className="py-20 lg:py-28 w-full">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[#135bec] font-bold text-lg mb-4">404</p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6">
              Página não encontrada
            </h1>
            <p className="text-lg text-[#4c669a] leading-relaxed mb-10">
              O endereço que você tentou acessar não existe ou foi movido.
            </p>

            <div className="rounded-2xl border border-gray-100 p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] inline-block">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-[#135bec] px-8 py-3 text-white font-bold hover:bg-[#0f4bc4] transition-colors"
              >
                Voltar para a home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
