"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface AdminHeaderProps {
  agencyId: string;
  agencyName: string;
  agencyLogoUrl: string | null;
  primaryColor: string;
  userName: string;
  userEmail: string;
  initials: string;
}

export default function AdminHeader({
  agencyName,
  agencyLogoUrl,
  primaryColor,
  userName,
  userEmail,
  initials,
}: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
      {/* Logo / Agency */}
      <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        {agencyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agencyLogoUrl} alt={agencyName} className="h-8 w-auto object-contain max-w-[120px]" />
        ) : (
          <>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="material-symbols-outlined text-white text-lg">change_history</span>
            </div>
            <span className="font-black text-slate-900 tracking-tight hidden sm:block">{agencyName}</span>
          </>
        )}
      </Link>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-1">
        <Link
          href="/admin"
          className="px-3 py-1.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Onboardings
        </Link>
        <Link
          href="/admin/analytics"
          className="px-3 py-1.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Analytics
        </Link>
        <Link
          href="/admin/templates"
          className="px-3 py-1.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Templates
        </Link>
        <Link
          href="/admin/billing"
          className="px-3 py-1.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Plano
        </Link>
        <Link
          href="/admin/settings"
          className="px-3 py-1.5 text-sm font-semibold text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          Configurações
        </Link>
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <button className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <span className="text-xs font-black text-white">{initials}</span>
            </div>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-xs font-bold text-slate-900 leading-none">{userName}</span>
              <span className="text-[11px] text-slate-500 leading-none mt-0.5 truncate max-w-[120px]">
                {userEmail}
              </span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[18px] hidden sm:block">
              expand_more
            </span>
          </button>

          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-900/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="p-1">
              <Link
                href="/admin/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Configurações
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sair do painel
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
