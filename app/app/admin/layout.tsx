import { redirect } from "next/navigation";
import { requireAgencySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminHeader from "./_components/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await requireAgencySession();
  } catch {
    redirect("/admin/login");
  }

  const user = await prisma.agencyUser.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  const initials = (user?.name ?? session.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex flex-col">
      <AdminHeader
        agencyId={session.agencyId}
        userName={user?.name ?? session.email}
        userEmail={user?.email ?? session.email}
        initials={initials}
      />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
