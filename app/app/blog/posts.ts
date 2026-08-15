// ponytail: 1 post só — objeto fixo em vez de MDX/CMS. Virar arquivo por post quando houver 3+.
export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
};

export const posts: Post[] = [
  {
    slug: "onboarding-e-o-primeiro-contato-real",
    title: "O onboarding é o primeiro contato real do cliente com a agência",
    excerpt:
      "O contrato já foi assinado. Agora começa o momento que decide se o cliente sente que fez a escolha certa — ou se já desconfia dela.",
    date: "2026-08-15",
    readTime: "4 min",
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
