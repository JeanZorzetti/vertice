import Link from "next/link";
import Logo from "@/app/_components/Logo";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "/funcionalidades" },
      { label: "Integrações", href: "/integracoes" },
      { label: "Preços", href: "/precos" },
      { label: "Novidades", href: "/novidades" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre nós", href: "/sobre" },
      { label: "Blog", href: "/blog" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Política de Privacidade", href: "/privacidade" },
      { label: "Termos de Uso", href: "/termos" },
      { label: "Segurança", href: "/seguranca" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-4">
              <Logo variant="full" height={28} className="text-[#0d121b]" />
            </div>
            <p className="text-[#4c669a] text-sm max-w-xs">
              Ajudando agências a fazer onboarding mais rápido, melhor e sem caos.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-bold mb-4">{col.title}</h4>
              <ul className="space-y-3 text-sm text-[#4c669a]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link className="hover:text-[#135bec] transition-colors" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-8">
          <p className="text-sm text-[#4c669a]">© 2025 Vértice. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
