# Design Review — Site Público do Vértice

**Data:** 2026-08-31
**Alvo:** superfície pública — `/`, `/precos`, `/funcionalidades`, `/integracoes`, `/sobre`, `/contato`, `/blog`
**Objetivo do usuário na superfície:** um dono de agência entender que isso resolve o caos do onboarding e criar conta no trial
**Restrição:** Next 16 + Tailwind 4, tokens já fixados em `app/globals.css`, produção viva em `vertice.roilabs.com.br`, deploy só por push na `main`

**Disciplinas rodadas:** `conversion-copy` → `behavioral-design` → `art-direction` → `motion-design` → `seo-geo` → `responsive-design` → `web-performance` → `accessibility` → `ui-verification`

**Método de verificação:** Playwright local (o MCP do Playwright não conectou na sessão), contra produção. 3 páginas × 3 larguras (360/768/1440): status, LCP, console, requisições falhas, overflow horizontal, screenshots. Mais uma passagem profunda na home a 1440: metadata, headings, nomes acessíveis, passagem de Tab, landmarks. Todo achado abaixo tem a medida junto.

---

## Diagnóstico

O site está tecnicamente saudável — LCP 388–800ms, console limpo, zero overflow horizontal em 360/768/1440 — e vazio de argumento. A home rola 2.197px e entrega uma manchete, um placeholder cinza e três links de menu; o maior elemento visual da página inteira é um esqueleto de carregamento (`animate-pulse`) fingindo ser o produto.

Pior: o pouco que a página afirma não é verdade. `/integracoes` vende Slack, HubSpot, Asana e Stripe, e nenhuma das quatro existe no repositório — `lib/` tem `google-drive`, `evolution`, `projectmanagement`, `mercadopago`, `claude`, `r2`, `brevo`. Isso não é problema de design, é o trial morrendo no dia 1.

---

## Ações

Ordenadas por severidade × frequência. Severidade 0-4.

### 1 — `conversion-copy` · Sev 4 · Integrações que não existem

**Achado:** `app/integracoes/page.tsx:11-36` vende 5 integrações. `grep -ril "slack\|hubspot\|asana" lib` → 0 arquivos. Só Google Drive existe de verdade. O mesmo texto se repete no card da home (`app/page.tsx:117`).

**Correção:** reduzir a página às reais — Google Drive, WhatsApp/Evolution, ClickUp, Meta + Google OAuth, Mercado Pago. As quatro fantasmas viram uma seção "No roadmap", visualmente distinta das que funcionam.

### 2 — `art-direction` · Sev 4 · O centro visual da home é um esqueleto de loading

**Achado:** o mockup de `app/page.tsx:47-107` ocupa ~600px de altura e é composto de barras `bg-gray-200` com `animate-pulse`. Na screenshot de 1440 lê como página que não carregou.

**Correção:** trocar por screenshot real de `/admin/onboardings` — o painel abre com o admin já semeado. Se não der para logar hoje, deletar o bloco: hero + prova é melhor que hero + esqueleto.

### 3 — `conversion-copy` · Sev 4 · A home não faz nenhum argumento

**Achado:** estrutura completa = hero → placeholder → 3 cards de navegação → footer. Sem problema, sem como-funciona, sem prova, sem âncora de preço, sem segundo CTA. Um único `/signup` no corpo da página.

**Correção:** inserir depois do hero:
- (a) o "antes" em 3 linhas — planilha de senha, áudio de WhatsApp, setup manual;
- (b) as 4 etapas do onboarding real como o "depois";
- (c) faixa de preço "R$ 97 · 14 dias grátis · sem cartão" + CTA de fechamento.

O conteúdo já está escrito em `docs/01_vision.md`.

### 4 — `seo-geo` · Sev 4 · Metadata da home em inglês

**Achado:** medido no ar — `document.title` = `"Vértice – Automated Client Onboarding"`, description = `"End client onboarding chaos. The smart portal for marketing agencies."` Inglês, em `lang="pt-BR"`, na URL de prioridade 1 do sitemap. Todas as outras páginas têm metadata em pt-BR; a home é a única que não exporta `metadata` e herda o fallback do layout.

**Correção:** `export const metadata` em `app/page.tsx` com título/descrição em português, e corrigir o fallback em `app/layout.tsx:12-16`.

### 5 — `responsive-design` · Sev 4 · Sem navegação no mobile; `/login` inalcançável

**Achado:** em 360px o header tem só logo + "Começar Grátis". `nav` é `hidden md:flex` e "Entrar" é `hidden sm:flex` (`app/_components/SiteHeader.tsx:11,19`). Não há hambúrguer. O footer também não tem "Entrar" (`app/_components/SiteFooter.tsx:5-30`). **No celular, uma agência já cliente não alcança `/login` de nenhuma página pública.**

**Correção:** adicionar "Entrar" à coluna Empresa do footer — 1 linha, resolve o bloqueio hoje — e um menu `<details>`/botão no header abaixo de `md` com os 3 links + Entrar.

### 6 — `accessibility` · Sev 3 · Ligaduras do Material Symbols no nome acessível

**Achado:** medido — nome do link do card da home = `"rocket_launch | Funcionalidades | …"`; item de plano em `/precos` = `"check_circle\nPortal white-label"`. Leitor de tela anuncia "rocket_launch" antes de cada título.

**Correção:** `aria-hidden="true"` em todo `<span className="material-symbols-outlined">`. Ocorre em home, funcionalidades, integrações, preços, contato, segurança e no admin — fazer de uma vez, não página a página.

### 7 — `seo-geo` · Sev 3 · Zero Open Graph no site inteiro

**Achado:** `[...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"]')]` → `[]`. Sem `metadataBase`. O GTM declarado em `docs/01_vision.md` é conteúdo no LinkedIn — cada compartilhamento sai como link cinza sem card.

**Correção:** `metadataBase` + `openGraph`/`twitter` em `app/layout.tsx`, e um `app/opengraph-image.tsx` (o Next gera a imagem, não precisa de asset).

### 8 — `ux-writing` · Sev 3 · Badge falso e frase agramatical

**Achado:** badge "Novidade: Formulários Inteligentes 2.0" (`app/page.tsx:23`) — a feature não existe, e um "2.0" num produto com zero clientes lê como fachada. Em `app/signup/page.tsx:69`: "comece a onboarding seus clientes hoje" está agramatical.

**Correção:** trocar o badge por algo verdadeiro e específico ("Onboarding completo em 4 etapas") ou remover. Corrigir a frase do signup para "comece a receber seus clientes hoje".

### 9 — `design-systems` · Sev 2 · Tokens definidos e nunca usados

**Achado:** `app/globals.css:3-22` define `--color-primary`, `--color-text-muted`, `--color-text-main` etc., e nenhuma página os usa. `#135bec`, `#4c669a` e `#0d121b` estão hardcoded em string de classe nas 8 páginas públicas. Os tokens existem e estão mortos — trocar a paleta hoje é find-replace.

**Correção:** trocar os literais pelas classes do `@theme` (`bg-primary`, `text-text-muted`). Sem inventar token novo: a escala já está fechada.

### 10 — `accessibility` + `seo-geo` · Sev 2 · Skip link, hierarquia e dados estruturados

**Achado:** sem skip link — o primeiro Tab é o logo, depois 5 links de header em toda página. A home salta H1 → H3, sem H2. `script[type="application/ld+json"]` → 0 em todo o site. Sem `llms.txt`.

**Correção:** skip link no `layout.tsx` + `id="main"`; os cards da home viram H2; `@graph` com `Organization` + `SoftwareApplication` + `Offer` na home e em `/precos`.

---

## Não achei nada relevante

- **`web-performance`:** LCP entre 388ms e 800ms nas 9 combinações página × largura, zero erro de console, zero requisição falha (os `ERR_ABORTED /login?_rsc=` são prefetch do Next, ruído). Nada a corrigir. A folha do Material Symbols é render-blocking de terceiro em todas as rotas, mas hoje não custa nada medível.
- **`motion-design`:** hover consistente (`-translate-y-1` + sombra) em botões e cards, durações coerentes. Único senão é o `animate-pulse` sem guarda de `prefers-reduced-motion` — some junto com a ação #2.
- **`behavioral-design`:** o diagnóstico está na ação #3; não há segundo achado independente.

---

## Fora de escopo agora

- **Prova social / logos de clientes:** a agência ainda é o único usuário (`docs/01_vision.md`, Fase 1). Inventar depoimento seria o mesmo erro da ação #1. Entra quando existir a primeira agência externa.
- **`/precos` vendendo "Análise com IA (Claude)" no Pro sem `ANTHROPIC_API_KEY` em produção:** é problema de env var, não de página — já está mapeado em `docs/handoff-proximos-passos.md`. Só vira achado de design se o trial começar antes da chave entrar.
- **Painel `/admin` e fluxo `/onboarding`:** fora do alvo escolhido. O fluxo do cliente segue não verificável por URL enquanto o Resend não estiver configurado.

---

## Conflito declarado

`art-direction` pede um visual de produto real e `conversion-copy` pede prova — mas o fluxo do cliente não é alcançável hoje (magic link depende do Resend). Resolvido pelo `/admin`, que é acessível com o admin semeado: screenshot verdadeiro do painel vale mais que mockup bonito, e um mockup melhor seria só uma mentira mais bem desenhada.

## Falso positivo descartado

O `getComputedStyle` reportou `outline: auto 0px` no CTA primário, o que sugeriria foco invisível. A screenshot do header com o botão focado mostra o anel de foco desenhado normalmente. **Não é achado** — fica registrado para ninguém repetir a medição.
