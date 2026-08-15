# Handoff — Vértice marketing site

Sessão anterior (2026-08-15): fechou o card "dar destino às âncoras href="#" da
navbar + sitemap" — commit `a22458b`, pushado e verificado em produção
(`vertice.roilabs.com.br`). Detalhes dessa entrega no fim deste arquivo.

Nesta sessão o usuário pediu 8 itens novos, vistos numa screenshot do header em
`vertice.roilabs.com.br/#features`. Nenhum foi implementado ainda — só este
handoff. Ordem sugerida: 5 → 4 → 7 primeiro (pequenos, sem ambiguidade), depois
1/2/3 (conteúdo, mesmo padrão das 8 páginas já criadas), 6 e 8 por último
(dependem de decisão do usuário / infra nova).

## 1-3. Páginas standalone: /funcionalidades, /precos, /integracoes

Hoje `Funcionalidades`, `Preços`, `Integrações` no header (`SiteHeader.tsx`) e
no footer (`SiteFooter.tsx`) apontam para anchors da home
(`/#features`, `/#pricing`, `/#integrations`). O pedido é criar páginas
próprias nessas rotas.

**Decisão em aberto:** as seções já existem em `app/app/page.tsx` (linhas
~113-266: Integrations, Features, Pricing). Perguntar ou decidir: as novas
páginas *substituem* as seções da home (que passam a linkar pra lá) ou
*duplicam* o conteúdo em página própria e a home continua com scroll interno?
O padrão das 8 páginas da sessão anterior (`app/app/sobre/page.tsx` etc.) é o
modelo a seguir: `SiteHeader` + `SiteFooter` + `<main>` com o mesmo design
system (`#135bec` accent, `#4c669a` muted, `rounded-2xl` cards, Material
Symbols). `/integracoes` vale expandir além da lista de logos atual (linha
~144 de `page.tsx`: só nomes em texto) — o pedido provavelmente quer uma
página com uma seção por integração (Google Drive, Slack, HubSpot, Asana,
Stripe), não só repetir a faixa de logos.

Depois de criar, atualizar `SiteHeader.tsx`/`SiteFooter.tsx` para apontar pra
`/funcionalidades`, `/precos`, `/integracoes` em vez de `/#...`, e adicionar as
3 rotas em `app/app/sitemap.ts`.

## 4. Remover botão "Agendar Demo" da home

`app/app/page.tsx:41-46` — botão sem `href`/`onClick`, nunca esteve
funcional (achado na sessão anterior). Remover o `<button>` inteiro; decidir
se o "Começar Grátis" (linha ~37-40, mesmo bloco) fica sozinho ou centralizado.
Diff pequeno, sem ambiguidade de conteúdo.

## 5. Logo pequena demais no header

`app/app/_components/Logo.tsx`: viewBox `0 0 180 64` (variant full), texto
"Vértice" em `fontSize="27"` dentro desse viewBox. `SiteHeader.tsx` renderiza
com `height={28}` e `SiteFooter.tsx` com `height={22}` — o texto acaba saindo
~12px efetivo (27 × 28/64), menor que o `text-sm` (14px) dos links do nav ao
lado. Ver a screenshot anexada: "Vértice" visivelmente menor que
"Funcionalidades"/"Preços"/"Integrações".

Duas rotas possíveis: (a) aumentar `height` passado em `SiteHeader`/
`SiteFooter` (ex.: 34-36), ou (b) aumentar `fontSize` dentro do próprio
`Logo.tsx` e recalcular o viewBox/posição pra não cortar o texto. (b) é mais
correto (a logo fica proporcional em qualquer lugar que a use — ela também
aparece em `login/page.tsx`, `onboarding/platforms/page.tsx`,
`admin/.../settings/page.tsx`, `signup/`), mas (a) é a fatia mínima se o
problema for só o header/footer públicos. Testar visualmente antes de
consolidar (Playwright ou `next dev` + screenshot).

## 6. /contato: trocar e-mail por formulário + WhatsApp

`app/app/contato/page.tsx` hoje tem 3 cards (E-mail, Testar produto, Já é
cliente). Pedido: **remover o card de e-mail**, adicionar um **formulário**
(provavelmente nome/e-mail/mensagem) e um **botão de WhatsApp**.

Pendências que só o usuário resolve:
- **Número de WhatsApp** — não existe em nenhum lugar do repo. Vai precisar de
  um `wa.me/<número>` real.
- **Destino do formulário** — não há API route de contato hoje. `lib/resend.ts`
  já tem `Resend` configurado (client lazy-init, `FROM_EMAIL =
  onboarding@vertice.app`) e é usado em `sendOnboardingCompletedEmail`/
  `sendChaseEmail`/`sendMagicLink` — o padrão mais barato é criar
  `app/lib/resend.ts` → nova função `sendContactFormEmail(...)` + uma API
  route `app/app/api/contact/route.ts` que a chama, e o form do client faz
  `fetch("/api/contact", { method: "POST" })`. Precisa confirmar
  `RESEND_API_KEY` está configurada no ambiente de produção (Vercel) antes de
  depender disso — não achei `.env` local no repo (ver nota da sessão
  anterior: sem GSC nem outras credenciais locais neste projeto).

## 7. Remover /vagas

Reverter a criação da sessão anterior: apagar `app/app/vagas/page.tsx`,
remover a entrada `{ label: "Vagas", href: "/vagas" }` de
`SiteFooter.tsx` (coluna "Empresa"), remover a linha `/vagas` de
`app/app/sitemap.ts`. Diff pequeno e mecânico.

## 8. Publicar um artigo no blog

`app/app/blog/page.tsx` hoje é uma página "coming soon" com 3 cards de tópico,
sem nenhum post real (decisão da sessão anterior: não fabricar posts falsos
com datas fictícias). Publicar um artigo de verdade muda esse pressuposto —
precisa de: (1) um tema/ângulo real pro primeiro post (perguntar ao usuário
ou puxar de algo que já esteja documentado em `docs/01_vision.md` /
`docs/02_product.md`, ainda não lidos nesta sessão), (2) uma rota
`/blog/[slug]/page.tsx` — YAGNI não criar sistema de MDX/CMS pra 1 post único,
uma página estática basta; adicionar MDX quando houver 3+ posts. (3) trocar a
página `/blog` de "coming soon" pra listar esse primeiro post real. (4)
adicionar a nova rota em `sitemap.ts`.

## Ambiente / gotchas confirmados na sessão anterior

- Repo: `C:\dev\vertice`, remote `github.com/JeanZorzetti/vertice`, deploy via
  Vercel (git-linked, projeto `jean-zorzettis-projects/vertice`) — push em
  `main` já dispara deploy de produção automaticamente, sem passo manual.
- `npm run build` (`prisma generate && next build`) não tem side effect de
  IndexNow/ping — diferente do padrão `roilabs`/Astro documentado na memória
  global. Seguro rodar direto.
- Sem `.env`/`.env.local` no repo local — nenhuma credencial (GSC, Resend, etc)
  verificável por aqui; qualquer feature que dependa de env var em produção
  precisa ser confirmada como configurada na Vercel antes de assumir que
  funciona.
- `git commit` nesse repo dá warning de `LF will be replaced by CRLF` — é só o
  autocrlf do Git no Windows, inofensivo, não é erro.

## Entrega da sessão anterior (referência, já concluída)

- `SiteHeader.tsx`/`SiteFooter.tsx` extraídos de `page.tsx` e reusados.
- 8 páginas novas criadas: `/novidades`, `/sobre`, `/vagas`, `/blog`,
  `/contato`, `/privacidade`, `/termos`, `/seguranca`.
- `sitemap.ts` com as rotas novas.
- Commit `a22458b`, push em `main`, deploy Vercel confirmado (todas as 8
  rotas responderam 200 em produção, 0 `href="#"` restantes na home).
- GSC: sitemap confirmado 200/válido em produção; submissão manual ao Search
  Console ficou por conta do usuário (sem credencial de GSC configurada para
  `vertice.roilabs.com.br` neste ambiente).
