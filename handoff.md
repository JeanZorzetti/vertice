# Handoff — Vértice marketing site

Sessão anterior (2026-08-15): fechou o card "dar destino às âncoras href="#" da
navbar + sitemap" — commit `a22458b`, pushado e verificado em produção
(`vertice.roilabs.com.br`).

Sessão seguinte (2026-08-15): os 8 itens pedidos numa screenshot do header
foram todos implementados. Dois commits, pushados e com `npm run build`
limpo antes de cada push:

- `d41aa25` — itens 5, 4, 7 (sem ambiguidade):
  - Logo do header/footer aumentada (28→36 / 22→28) pra não ficar menor que
    os links do nav.
  - Botão "Agendar Demo" removido da home (nunca teve `href`/`onClick`).
  - Rota `/vagas` revertida (página, link do footer, entrada no sitemap).
- `5eb54ca` — itens 1/2/3, 6, 8 (decisões confirmadas com o usuário):
  - `/funcionalidades`, `/precos`, `/integracoes` criadas e **substituem**
    as seções `#features`/`#pricing`/`#integrations` da home (decisão do
    usuário). Header, footer e sitemap apontam pra elas. Home ganhou uma
    faixa de 3 cards linkando pra cada uma. `/integracoes` tem uma seção por
    integração (Google Drive, Slack, HubSpot, Asana, Stripe) em vez de só a
    faixa de logos.
  - `/contato`: card de e-mail trocado por formulário (`ContactForm.tsx` +
    `POST /api/contact` + `sendContactFormEmail` em `lib/resend.ts`) e botão
    de WhatsApp (`wa.me/5562983443919`, número passado pelo usuário).
  - Blog: primeiro post real publicado em `/blog/onboarding-e-o-primeiro-
    contato-real` (tema puxado de `docs/01_vision.md`/`02_product.md`, a
    pedido do usuário). `posts.ts` como fonte única — sem MDX/CMS pra 1 post
    só. Listagem `/blog` trocou de "coming soon" pro post publicado.

## Pendência real: RESEND_API_KEY em produção não confirmada

O formulário de `/contato` depende de `RESEND_API_KEY` estar configurada na
Vercel. **Não foi possível confirmar** — `vercel env ls` falhou porque o
projeto não está linkado localmente nesta máquina (`vercel link` pediria
`--team`/`--project`, não tentado por ser não-interativo). `lib/resend.ts`
já é usado em produção para magic link e e-mails de onboarding, então a key
provavelmente existe — mas isso não prova que o formulário novo funciona.
**Testar de verdade**: enviar o formulário em `vertice.roilabs.com.br/contato`
e confirmar que o e-mail chega em `contato@vertice.app`.

## Ambiente / gotchas confirmados

- Repo: `C:\dev\vertice`, remote `github.com/JeanZorzetti/vertice`, deploy via
  Vercel (git-linked, projeto `jean-zorzettis-projects/vertice`) — push em
  `main` já dispara deploy de produção automaticamente, sem passo manual.
- `npm run build` (`prisma generate && next build`) não tem side effect de
  IndexNow/ping — diferente do padrão `roilabs`/Astro documentado na memória
  global. Seguro rodar direto.
- **`npm run build` reescreve `app/tsconfig.json`** (formata `lib`/`paths`/
  `include`/`exclude` em multi-linha e adiciona `.next/dev/types/**/*.ts`) —
  toda vez. Não é uma mudança real, é o Next normalizando o arquivo. Rodar
  `git checkout -- app/tsconfig.json` antes de `git add` pra não sujar o
  commit com isso.
- Sem `.env`/`.env.local` no repo local — nenhuma credencial (GSC, Resend, etc)
  verificável por aqui; qualquer feature que dependa de env var em produção
  precisa ser confirmada como configurada na Vercel antes de assumir que
  funciona (ver pendência acima).
- `git commit` nesse repo dá warning de `LF will be replaced by CRLF` — é só o
  autocrlf do Git no Windows, inofensivo, não é erro.
- Projeto Vercel não está linkado localmente nesta máquina (`vercel env`/
  `vercel link` pedem `--team`/`--project`) — se precisar checar env vars de
  produção de novo, ou pedir o team/project ID pro usuário, ou usar o
  dashboard da Vercel.

## Entrega da sessão anterior (referência)

- `SiteHeader.tsx`/`SiteFooter.tsx` extraídos de `page.tsx` e reusados.
- 8 páginas criadas: `/novidades`, `/sobre`, `/vagas` (removida nesta sessão),
  `/blog`, `/contato`, `/privacidade`, `/termos`, `/seguranca`.
- Commit `a22458b`, deploy Vercel confirmado (todas as rotas responderam 200
  em produção, 0 `href="#"` restantes na home).
- GSC: sitemap confirmado 200/válido em produção; submissão manual ao Search
  Console ficou por conta do usuário.
