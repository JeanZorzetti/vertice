# Handoff — Vértice marketing site

## Pendente nesta sessão (2026-08-15)

### 1. Criar página 404 customizada

Hoje o site usa o 404 default do Next (fundo preto, texto genérico "This
page could not be found" — sem `SiteHeader`/`SiteFooter`, sem o design
system do site). Falta um `app/app/not-found.tsx` com o mesmo padrão visual
das outras páginas (`SiteHeader` + `SiteFooter` + `<main>`, `#135bec`
accent, `rounded-2xl` cards) e um link de volta pra home.

### 2. Artigo do blog dando 404 — CAUSA RAIZ ACHADA E CORRIGIDA, falta confirmar em produção

`vertice.roilabs.com.br/blog/onboarding-e-o-primeiro-contato-real` estava
retornando 404 apesar do slug bater com `posts.ts` e do build compilar sem
erro. Causa: `app/app/blog/[slug]/page.tsx` (criado na sessão anterior)
lia `params` como objeto síncrono —

```ts
export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug); // params.slug vinha undefined
```

No App Router do Next 16 (`next 16.1.6`, confirmado no `npm run build`),
`params` é uma `Promise` e precisa de `await`. Sem isso, `params.slug` é
`undefined` em runtime (o build não acusa erro), `getPost(undefined)`
retorna `undefined`, e a página cai em `notFound()` mesmo com a URL certa.
O padrão correto já existe no repo em `onboarding/[token]/page.tsx`
(`params: Promise<{ token: string }>` + `const { token } = await params`) —
era só replicar.

**Já corrigido e pushado** (commit `ef612fe`, branch `main`): `page.tsx` e
`generateMetadata` agora usam `params: Promise<{ slug: string }>` +
`await params`. `npm run build` local confirmou a rota `/blog/[slug]`
gerada estaticamente pro slug real.

**Falta confirmar**: o deploy da Vercel ainda não tinha propagado no fim
desta sessão (`curl` pra URL de produção ainda voltava 404 ~1 min depois do
push). Primeira coisa a fazer na próxima sessão: `curl -s -o /dev/null -w
"%{http_code}" https://vertice.roilabs.com.br/blog/onboarding-e-o-primeiro-contato-real`
— se ainda 404, checar o deploy mais recente no dashboard da Vercel (o
projeto não está linkado localmente nesta máquina, ver gotcha abaixo).

## Lição pra qualquer rota `[param]` nova neste repo

Toda vez que criar uma rota dinâmica (`[slug]`, `[id]`, etc.) em
`app/app/**`, tipar `params` como `Promise<{...}>` e dar `await` — nunca
como objeto síncrono. É o padrão do Next 16 e o repo já segue isso em
`onboarding/[token]/*`; a página do blog quebrou por não seguir.

## Ambiente / gotchas confirmados

- Repo: `C:\dev\vertice`, remote `github.com/JeanZorzetti/vertice`, deploy via
  Vercel (git-linked, projeto `jean-zorzettis-projects/vertice`) — push em
  `main` já dispara deploy de produção automaticamente, sem passo manual.
  O deploy leva pelo menos ~1-2 min pra propagar; não confirmar "no ar" só
  porque o push foi feito, testar a URL real depois.
- Projeto Vercel **não está linkado localmente** nesta máquina — `vercel env
  ls` / `vercel link` pedem `--team`/`--project` (não tentado, seria
  destrutivo demais adivinhar). Se precisar checar env vars ou status de
  deploy, usar o dashboard da Vercel ou pedir o team/project ID.
- **`npm run build` reescreve `app/tsconfig.json`** (formata `lib`/`paths`/
  `include`/`exclude` em multi-linha, adiciona `.next/dev/types/**/*.ts`) —
  toda vez que builda. Não é mudança real. Rodar `git checkout --
  app/tsconfig.json` antes de `git add` pra não sujar o commit.
- Sem `.env`/`.env.local` no repo local — nenhuma credencial (GSC, Resend,
  etc.) verificável por aqui.
- `git commit` nesse repo dá warning de `LF will be replaced by CRLF` — é o
  autocrlf do Git no Windows, inofensivo.
- Pendência ainda aberta de sessão anterior: não foi confirmado se
  `RESEND_API_KEY` está configurada na Vercel de produção — o formulário de
  `/contato` depende dela. Testar enviando de verdade e confirmar que o
  e-mail chega em `contato@vertice.app`.

## Entrega recente (referência)

- Sessão 2026-08-15 (manhã): logo do header/footer ajustada, botão "Agendar
  Demo" removido, `/vagas` revertida, `/funcionalidades` + `/precos` +
  `/integracoes` criadas substituindo seções da home, `/contato` com
  formulário + WhatsApp, primeiro post do blog publicado. Commits `d41aa25`,
  `5eb54ca`, `756f6f7`.
- Sessão 2026-08-15 (tarde): fix do 404 no post do blog. Commit `ef612fe`.
- Sessão anterior: 8 páginas de marketing criadas, âncoras `href="#"`
  resolvidas. Commit `a22458b`.
