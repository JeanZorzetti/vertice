# Handoff — Vértice marketing site

## Resolvido nesta sessão (2026-08-15, continuação)

### 1. Página 404 customizada — FEITO

Criado `app/app/not-found.tsx` seguindo o padrão visual das outras páginas
(`SiteHeader` + `SiteFooter`, accent `#135bec`, card `rounded-2xl`, botão
"Voltar para a home"). `npm run build` confirmou `/_not-found` gerada
estaticamente, sem erros. Commit `4905117`, pushado em `main`.

### 2. Artigo do blog dando 404 — CONFIRMADO CORRIGIDO EM PRODUÇÃO

`curl` pra `https://vertice.roilabs.com.br/blog/onboarding-e-o-primeiro-contato-real`
voltou **200**. Causa raiz (abaixo) e fix já estavam pushados no commit
`ef612fe`; só faltava a confirmação do deploy, feita agora.

Causa: `app/app/blog/[slug]/page.tsx` lia `params` como objeto síncrono em
vez de `Promise<{ slug: string }>` + `await` (obrigatório no Next 16). Fix
no commit `ef612fe`.

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

## Pendente

- `RESEND_API_KEY` na Vercel de produção não confirmada — o formulário de
  `/contato` depende dela. Testar enviando de verdade e confirmar que o
  e-mail chega em `contato@vertice.app`.

## Entrega recente (referência)

- Sessão 2026-08-15 (manhã): logo do header/footer ajustada, botão "Agendar
  Demo" removido, `/vagas` revertida, `/funcionalidades` + `/precos` +
  `/integracoes` criadas substituindo seções da home, `/contato` com
  formulário + WhatsApp, primeiro post do blog publicado. Commits `d41aa25`,
  `5eb54ca`, `756f6f7`.
- Sessão 2026-08-15 (tarde): fix do 404 no post do blog. Commit `ef612fe`.
- Sessão 2026-08-15 (continuação): confirmado deploy do fix do blog (200 em
  prod) + página 404 customizada criada. Commit `4905117`.
- Sessão anterior: 8 páginas de marketing criadas, âncoras `href="#"`
  resolvidas. Commit `a22458b`.
