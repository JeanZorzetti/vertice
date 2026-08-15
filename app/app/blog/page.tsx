import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/app/_components/SiteHeader";
import SiteFooter from "@/app/_components/SiteFooter";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Blog – Vértice",
  description: "Onboarding de clientes, automação e operação de agências.",
};

export default function BlogPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white font-sans text-[#0d121b]">
      <SiteHeader />

      <main className="flex-grow">
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Blog</h1>
            <p className="text-lg text-[#4c669a] max-w-xl mx-auto">
              Onboarding de clientes, automação e operação de agências.
            </p>
          </div>

          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-2xl border border-gray-100 p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow"
              >
                <p className="text-sm font-semibold text-[#4c669a] uppercase tracking-wide mb-3">
                  {new Date(post.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })} · {post.readTime} de leitura
                </p>
                <h2 className="text-2xl font-bold mb-3">{post.title}</h2>
                <p className="text-[#4c669a] leading-relaxed">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
