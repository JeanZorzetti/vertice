# Dossiê — Vértice

**Gerado em:** 2026-08-15
**Repositório:** `C:\dev\vertice` → `github.com/JeanZorzetti/vertice` (branch `main`)
**Produção:** https://vertice.roilabs.com.br (Vercel, projeto `jean-zorzettis-projects/vertice`)
**Último commit:** `9909873` — 2026-08-15 16:25 -0300

---

## 1. O que é

**Vértice** é um SaaS B2B: um portal de onboarding white-label para agências de marketing.

A agência gera um link único, envia ao cliente recém-contratado, e o cliente percorre um fluxo guiado de 4 etapas que coleta tudo que a agência precisa para começar — dados da empresa, assets de marca, acessos às plataformas (via OAuth, sem senha trafegando) e briefing estratégico. Ao concluir, a agência é notificada, uma pasta é criada no Drive, um card entra no gerenciador de projetos e a IA gera um documento de marca a partir do briefing.

**Posicionamento declarado:** *"O Typeform do onboarding de agências de marketing."*

**Modelo de cobrança:** mensalidade da agência (o cliente final nunca vê o Vértice — vê a marca da agência).

---

## 2. Estado real (leitura verificada, não documental)

### 🔴 O produto está fora do ar em produção

O site de marketing responde normalmente, mas **a aplicação SaaS não funciona em produção**:

```
GET https://vertice.roilabs.com.br/api/health  →  500
{"db":"error","message":"Can't reach database server at 127.0.0.1:5432","dbUrl":"NOT SET"}
```

`DATABASE_URL` **não está configurada no ambiente de produção da Vercel**. O Prisma cai no default local. Consequência prática: `/signup`, `/admin/login`, todo o fluxo `/onboarding/[token]`, o webhook do Mercado Pago e a API pública `/api/v1/*` estão quebrados em produção. Nenhuma agência consegue criar conta ou entrar hoje.

Isso é o bloqueador nº 1 — está acima de qualquer item de roadmap.

### ✅ O que responde em produção

| Rota | Status |
|---|---|
| `/` (home) | 200 |
| `/precos` | 200 |
| `/signup` (render da página) | 200 |
| `/admin/login` (render da página) | 200 |
| `/blog/onboarding-e-o-primeiro-contato-real` | 200 |
| rota inexistente → 404 customizado | 404 |
| `/api/health` | **500** |

Ou seja: **tudo que é estático funciona, tudo que toca o banco falha.**

---

## 3. Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| UI | React | 19.2.3 |
| Linguagem | TypeScript | ^5 |
| Estilo | Tailwind CSS | v4 (via `@tailwindcss/postcss`) |
| ORM | Prisma + adapter `pg` | 7.4.2 |
| Banco | PostgreSQL | — |
| Auth | JWT via `jose` + cookie httpOnly | 6.1.3 |
| Senhas | bcryptjs | 3.0.3 |
| E-mail | Resend | 6.9.3 |
| Storage | Cloudflare R2 (AWS SDK S3 + presigner) | 3.1000.0 |
| IA | `@anthropic-ai/sdk` (claude-sonnet-4-6) | 0.78.0 |
| Google APIs | googleapis | 171.4.0 |
| Pagamentos | mercadopago | 2.12.0 |
| E2E | Playwright | 1.58.2 |
| Deploy | Vercel, região `gru1` | — |

**Nota de versão:** o `lib/claude.ts` chama `claude-sonnet-4-6`. A família mais recente hoje é Claude 5 (`claude-opus-5`, `claude-sonnet-5`) — vale reavaliar o modelo quando mexer na análise de briefing.

---

## 4. Estrutura do repositório

```
C:\dev\vertice\
├── docs/                     → 5 documentos de produto (visão, produto, roadmap, stack, monetização)
├── .github/workflows/        → auto-chase.yml (cron diário)
├── 1_..5_*.html              → 5 protótipos HTML originais (Tailwind CDN) — referência de design
├── handoff.md                → notas da sessão anterior
├── DOSSIE.md                 → este arquivo
└── app/                      → a aplicação Next.js inteira
    ├── app/                  → App Router: 30 páginas + 36 API routes
    ├── lib/                  → 13 módulos de integração
    ├── prisma/               → schema + 8 migrations + seed
    ├── e2e/smoke.spec.ts     → único arquivo de teste
    ├── scripts/set-r2-cors.ts
    ├── middleware.ts
    └── vercel.json
```

**Volume:** ~11.200 linhas de TypeScript/TSX (excluindo `node_modules`).

---

## 5. Modelo de dados

10 modelos, 2 enums, 8 migrations aplicadas.

```
Agency ──┬── AgencyUser        (login da equipe, bcrypt)
         ├── Client ── Onboarding ──┬── OnboardingStep    (1 linha por etapa, data em Json)
         │                          ├── MagicLink          (token, expiresAt, usedAt)
         │                          ├── AssetUpload        (r2Key)
         │                          ├── PlatformConnection (tokens AES-256-GCM)
         │                          └── CampaignResult     (1:1 — spend/leads/revenue)
         └── OnboardingTemplate    (isPublic + usageCount → marketplace)
```

**Enums:** `OnboardingStatus` (PENDING | IN_PROGRESS | COMPLETED), `Platform` (META | GOOGLE_ADS | GOOGLE_ANALYTICS | WORDPRESS).

**Multitenancy:** por aplicação — `agencyId` filtrado em query, sem RLS no banco. O isolamento depende inteiramente do código estar correto em toda rota autenticada.

**Campos de configuração da agência** (tudo em `Agency`): `logoUrl`, `primaryColor`, `webhookUrl`, `whatsappPhone`, `contractTemplate`, `apiKeyHash`, `pmTool`/`pmApiKey`/`pmApiKey2`/`pmListId`, `plan`, `trialEndsAt`, `mpSubscriptionId`, `mpSubscriptionStatus`, `onboardedAt`.

---

## 6. Superfície de rotas

### Páginas públicas (marketing)
`/` · `/funcionalidades` · `/precos` · `/integracoes` · `/sobre` · `/novidades` · `/blog` · `/blog/[slug]` · `/contato` · `/privacidade` · `/termos` · `/seguranca` · `/signup` · `/login` · `not-found`

### Portal do cliente — `/onboarding/[token]/*`
`contract` (condicional) → `page` (Step 1: empresa) → `brand-assets` (Step 2: upload) → `platforms` (Step 3: OAuth) → `briefing` (Step 4) → `done`

### Painel da agência — `/admin/*`
`login` · dashboard · `onboardings/[id]` · `analytics` · `templates` · `marketplace` · `billing` · `settings`

### API (36 rotas)

| Grupo | Rotas |
|---|---|
| Auth | `auth/magic-link`, `auth/verify`, `auth/logout`, `agency/auth/login`, `agency/signup` |
| Onboarding (cliente) | `onboarding/[token]`, `/step`, `/assets`, `/connections`, `/sign-contract` |
| Agência | `agency/onboardings` (+`[id]`, `/analyze`, `/campaign`, `/report`), `agency/settings`, `agency/analytics`, `agency/templates` (+`[id]`), `agency/api-key`, `agency/onboarded` |
| Billing | `agency/billing`, `/subscribe`, `/cancel`, `webhooks/mercadopago` |
| OAuth | `oauth/meta` + `/callback`, `oauth/google` + `/callback` |
| Marketplace | `marketplace/templates`, `/[id]/use` |
| API pública v1 | `v1/onboardings`, `v1/onboardings/[id]` |
| Infra | `health`, `cron/auto-chase`, `contact` |

---

## 7. Integrações externas

| Integração | Módulo | Para quê |
|---|---|---|
| Resend | `lib/resend.ts` (286 linhas) | Magic link, notificação de conclusão, auto-chase, formulário de contato |
| Cloudflare R2 | `lib/r2.ts` | Upload de assets via presigned URL (cliente sobe direto, sem passar pelo servidor) |
| Meta OAuth | `api/oauth/meta/*` | Business Manager — token de longa duração, criptografado |
| Google OAuth | `api/oauth/google/*` | Google Ads + Analytics |
| Google Drive | `lib/google-drive.ts` | Service Account cria pasta por onboarding |
| Evolution API | `lib/evolution.ts` | Notificações WhatsApp |
| Anthropic | `lib/claude.ts` | `analyzeBriefing()` → relatório markdown do briefing |
| Mercado Pago | `lib/mercadopago.ts` | Assinaturas (Preapproval) + webhook assinado |
| ClickUp / Notion / Trello | `lib/projectmanagement.ts` | `createProjectTask()` ao concluir onboarding |
| Webhook próprio | `lib/webhook.ts` | Dispatcher configurável pela agência |

---

## 8. Segurança

**O que está bem feito:**

- Tokens OAuth criptografados com **AES-256-GCM** (`lib/crypto.ts`) — IV de 96 bits, auth tag, formato `iv.ciphertext.tag`. Chave validada como hex de 64 chars.
- API keys **nunca persistidas em plaintext** — só o SHA-256 (`lib/apikey.ts`); a chave crua (`vtx_` + 48 hex) é exibida uma única vez.
- Senhas com bcrypt (custo 12).
- Sessões em JWT (`jose`) em cookie httpOnly, com `type` distinguindo `agency` de `client`.
- OAuth state assinado (`signOAuthState`/`verifyOAuthState`) — anti-tampering.
- Uploads via presigned URL com expiração curta.
- Webhook do Mercado Pago com verificação de assinatura.
- `robots.ts` bloqueia `/api/`, `/admin`, `/onboarding`.
- `.gitignore` cobre `.env*` explicitamente.

**Pontos de atenção:**

- 🟡 **Credenciais default versionadas** — `prisma/seed.ts` cria `admin@roi-labs.com` / `vertice2025`, e `e2e/smoke.spec.ts` usa os mesmos valores como fallback. Se essa seed já rodou em qualquer ambiente exposto, é uma porta aberta com senha pública no GitHub.
- 🟡 **`/api/health` vaza detalhe de infraestrutura** — retorna a mensagem de erro do Prisma e a `DATABASE_URL` mascarada, sem autenticação. A máscara só cobre a senha; host, porta e nome do banco ficam visíveis.
- 🟡 **Isolamento multitenant é responsabilidade do código** — sem RLS no Postgres, um `where` esquecido em qualquer rota nova vaza dados entre agências. Não há teste cobrindo isso.
- 🟡 **`pmApiKey`/`pmApiKey2` em plaintext** no `Agency` — diferente dos tokens OAuth, que são criptografados. Inconsistência real de tratamento de segredo.

---

## 9. Testes e CI

- **Um** arquivo de teste: `e2e/smoke.spec.ts` (161 linhas, Playwright) — cobre login da agência, criação de onboarding e o caminho feliz do cliente (steps 1→4→done). Exige servidor rodando + `npm run db:seed`.
- **Zero** testes unitários. `lib/crypto.ts`, `lib/apikey.ts` e o cálculo de ROAS não têm nenhuma verificação.
- **CI:** `.github/workflows/auto-chase.yml` — cron diário 09:00 BRT chamando `/api/cron/auto-chase` com `CRON_SECRET`. É o único workflow; **não há CI de build, lint ou teste**.

---

## 10. Deploy e ambiente

- **Vercel git-linked:** push em `main` dispara deploy de produção automaticamente. Sem passo manual. Leva ~1-2 min para propagar — não confirmar "no ar" pelo push, testar a URL.
- **Build:** `prisma generate && next build` (definido no `package.json` e no `vercel.json`).
- **Região:** `gru1` (São Paulo).
- **O projeto Vercel não está linkado nesta máquina** — `vercel env ls` / `vercel link` pedem `--team`/`--project`. Para inspecionar env vars, usar o dashboard.

### Variáveis de ambiente referenciadas no código (30)

```
DATABASE_URL                 ← 🔴 AUSENTE EM PRODUÇÃO
JWT_SECRET  ENCRYPTION_KEY  CRON_SECRET
RESEND_API_KEY  RESEND_FROM                        ← RESEND_API_KEY não confirmada
R2_ACCOUNT_ID  R2_ACCESS_KEY_ID  R2_SECRET_ACCESS_KEY  R2_BUCKET_NAME  R2_PUBLIC_URL
META_APP_ID  META_APP_SECRET
GOOGLE_CLIENT_ID  GOOGLE_CLIENT_SECRET
GOOGLE_SA_EMAIL  GOOGLE_SA_PRIVATE_KEY  GOOGLE_DRIVE_PARENT_ID
EVOLUTION_API_URL  EVOLUTION_API_KEY  EVOLUTION_INSTANCE
MP_ACCESS_TOKEN  MP_WEBHOOK_SECRET  MP_PLAN_STARTER_ID  MP_PLAN_PRO_ID  MP_PLAN_AGENCY_ID
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL  NEXT_PUBLIC_BASE_DOMAIN  NODE_ENV
```

**Não existe `.env.example` no repo** — a lista acima é a única fonte confiável de "o que precisa estar configurado". Vale versionar um `.env.example` a partir dela.

### IDs de planos do Mercado Pago (do roadmap)

| Plano | Preço | ID |
|---|---|---|
| Starter | R$ 97 | `c696c00ae61a40748b010c83d2ae4f5f` |
| Pro | R$ 197 | `3c72932f00334ee28d5f98862f2926d6` |
| Agency | R$ 397 | `38550466d48f462cb4fd34f20c819db0` |

**Limites por plano** (`getClientLimit`): trial = 3 · starter = 5 · pro = 20 · agency = ilimitado · inactive = 0.

---

## 11. Roadmap: o que a documentação diz vs. o que o código mostra

As 3 fases e os 12 sprints estão marcados como **concluídos** em `docs/03_roadmap.md`, e o código corrobora — cada sprint tem migration, rota e página correspondentes.

| Fase | Sprints | Entregas principais | Critério Go/No-Go declarado |
|---|---|---|---|
| **1 — MVP** | 1-4 | Schema, magic link, 4 steps, painel admin, OAuth Meta/Google, deploy | 3 clientes reais concluídos, zero intervenção manual |
| **2 — Vendável** | 5-8 | White-label, subdomínio por agência, auto-chase, WhatsApp, Drive, webhooks, IA, analytics, templates, billing MP, tour | 5 agências pagantes, MRR > R$ 3k, churn < 10% |
| **3 — Escala** | 9-12 | Assinatura digital (Lei 14.063/2020), API pública REST, marketplace de templates, integrações PM, resultados de campanha | 30 agências, MRR > R$ 25k, NPS > 60 |

**A ressalva importante:** "sprint concluído" aqui significa *código escrito e deployado*, não *critério de negócio atingido*. Os Go/No-Go de todas as três fases são métricas de clientes reais e receita — e com a produção sem banco, nenhum deles pode nem começar a ser medido. O produto tem 24 semanas de features e zero usuários funcionais hoje.

---

## 12. Inconsistências e dívida encontradas

| # | Achado | Onde | Gravidade |
|---|---|---|---|
| 1 | `DATABASE_URL` ausente em produção — SaaS inteiro fora do ar | Vercel env | 🔴 Crítico |
| 2 | `RESEND_API_KEY` não confirmada em produção — form de `/contato` depende dela | Vercel env | 🟠 Alto |
| 3 | Preços divergentes: docs dizem R$ 197/497/997; código e `/precos` dizem R$ 97/197/397 | `docs/05_monetization.md` | 🟠 Alto |
| 4 | Credenciais default (`vertice2025`) versionadas em seed e e2e | `prisma/seed.ts`, `e2e/smoke.spec.ts` | 🟠 Alto |
| 5 | Páginas órfãs com dados fake hardcoded fora do `[token]` | `app/onboarding/brand-assets/page.tsx`, `app/onboarding/platforms/page.tsx` | 🟡 Médio |
| 6 | `README.md` ainda é o boilerplate do `create-next-app` | `app/README.md` | 🟡 Médio |
| 7 | Sem `.env.example` | raiz de `app/` | 🟡 Médio |
| 8 | Sem CI de build/lint/teste — só o cron | `.github/workflows/` | 🟡 Médio |
| 9 | `pmApiKey` em plaintext enquanto tokens OAuth são criptografados | `schema.prisma` | 🟡 Médio |
| 10 | 12 commits para 12 sprints — histórico comprimido, sem rastreabilidade por feature | git | 🔵 Baixo |
| 11 | Protótipos HTML na raiz usando Tailwind CDN, fora do build | `1_*.html` … `5_*.html` | 🔵 Baixo |
| 12 | `docs/03_roadmap.md` diz "Última atualização: Março 2026" mas descreve trabalho de agosto | `docs/03_roadmap.md` | 🔵 Baixo |

### Itens 5 — detalhe

`app/onboarding/brand-assets/page.tsx` e `app/onboarding/platforms/page.tsx` existem **fora** do segmento `[token]`. São mockups estáticos com dados inventados (`Vértice_Logo_Vector.svg`, `connected: true` fixo). O fluxo real é `/onboarding/[token]/brand-assets` e `/onboarding/[token]/platforms`. As duas versões órfãs estão protegidas pelo middleware, mas se alguma sessão chegar nelas o cliente vê arquivos que não são dele. São resquício do protótipo — devem ser deletadas.

---

## 13. Armadilhas conhecidas do repo

Confirmadas em sessões anteriores, valem para qualquer trabalho futuro aqui:

1. **Rotas dinâmicas no Next 16** — `params` é `Promise<{...}>` e precisa de `await`. Tipar como objeto síncrono causa 404 silencioso em produção. Foi exatamente isso que quebrou o post do blog (corrigido em `ef612fe`). O padrão correto já está em `onboarding/[token]/*`.
2. **`npm run build` reescreve `app/tsconfig.json`** toda vez (reformata `lib`/`paths`/`include`/`exclude`, adiciona `.next/dev/types/**/*.ts`). Não é mudança real — rodar `git checkout -- app/tsconfig.json` antes do `git add`.
3. **Warning `LF will be replaced by CRLF`** no commit — autocrlf do Git no Windows, inofensivo.
4. **Deploy leva 1-2 min** — testar a URL real antes de declarar no ar.

---

## 14. Próximos passos, em ordem

1. **Configurar `DATABASE_URL` na Vercel de produção.** Nada mais importa até isso. Validar com `curl https://vertice.roilabs.com.br/api/health` retornando `{"db":"ok",...}`.
2. **Rodar as migrations contra o banco de produção** e a seed (com senha trocada, não a default).
3. **Confirmar `RESEND_API_KEY`** enviando pelo `/contato` de verdade e verificando a chegada.
4. **Auditar as demais env vars** contra a lista da seção 10 — R2, OAuth, MP e Anthropic provavelmente estão no mesmo estado da `DATABASE_URL`.
5. **Trocar a senha default** e remover o fallback hardcoded do e2e.
6. **Rodar o smoke E2E contra produção** — é o teste de aceitação que já existe e cobre o caminho crítico inteiro.
7. Só então: deletar as páginas órfãs, alinhar os preços na doc, escrever o `.env.example` e o README de verdade.

A prioridade real deste projeto não é mais roadmap de feature — é fazer as 24 semanas de código já escrito efetivamente ligarem.
