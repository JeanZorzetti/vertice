import Link from "next/link";
import Logo from "@/app/_components/Logo";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <Logo variant="full" height={36} className="text-[#0d121b]" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link className="text-sm font-medium text-[#4c669a] hover:text-[#135bec] transition-colors" href="/funcionalidades">Funcionalidades</Link>
          <Link className="text-sm font-medium text-[#4c669a] hover:text-[#135bec] transition-colors" href="/precos">Preços</Link>
          <Link className="text-sm font-medium text-[#4c669a] hover:text-[#135bec] transition-colors" href="/integracoes">Integrações</Link>
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
  );
}
