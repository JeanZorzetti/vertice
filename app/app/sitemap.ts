import type { MetadataRoute } from "next";

export const SITE_URL = "https://vertice.roilabs.com.br";

// ponytail: só a superfície pública de marketing. /admin e /onboarding exigem sessão
// e /login existe para quem já é cliente — nada disso tem valor de busca.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/signup`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/novidades`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/sobre`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/contato`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacidade`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/termos`, lastModified, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/seguranca`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
