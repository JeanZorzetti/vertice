# Vértice — Roadmap

**Última atualização:** Março 2026
**Metodologia:** Sprints quinzenais com critério Go/No-Go ao fim de cada fase

---

## Status Atual

```
✅ FASE 1 — Sprint 1 (CONCLUÍDO)
- Prisma 7 + schema multitenant (Agency, Client, Onboarding, Step, MagicLink, AssetUpload, PlatformConnection)
- Magic link auth: Resend → token UUID → session JWT (jose) → cookie httpOnly
- API: POST /api/auth/magic-link, GET /api/auth/verify, POST /api/auth/logout
- API: GET/PUT /api/onboarding/[token], PUT /api/onboarding/[token]/step
- API: POST/DELETE /api/onboarding/[token]/assets (presigned R2)
- API: GET/POST /api/agency/onboardings, GET/DELETE /api/agency/onboardings/[id]
- Middleware: protege /admin/* (AgencySession) e /onboarding/* (ClientSession)
- lib/prisma.ts, lib/auth.ts, lib/resend.ts, lib/r2.ts

✅ FASE 1 — Sprint 2 (CONCLUÍDO)
- Fluxo de onboarding completo: 4 etapas dinâmicas com DB
  └── /onboarding/[token]            → Step 1: Dados da Empresa
  └── /onboarding/[token]/brand-assets → Step 2: Upload R2 (drag & drop, presigned URL)
  └── /onboarding/[token]/platforms   → Step 3: Plataformas (OAuth em Sprint 4)
  └── /onboarding/[token]/briefing    → Step 4: Briefing estratégico
  └── /onboarding/[token]/done        → Conclusão
- Layout com sidebar dinâmica (steps completados, etapa ativa)
- Auto-save por step, retoma de onde parou, progresso persistido no DB

✅ FASE 1 — Sprint 3 (CONCLUÍDO)
- Auth da agência: /admin/login + POST /api/agency/auth/login (bcryptjs)
- Admin layout com header compartilhado + logout
- /admin com dados reais do DB: métricas (total, em andamento, pendentes, concluídos/mês)
- Tabela de onboardings com progresso real e link para detalhe
- Modal "Novo Cliente": cria client + onboarding + envia magic link
- /admin/onboardings/[id]: dados da empresa, briefing, assets com download R2, histórico de links
- Notificação por e-mail ao concluir: Resend para todos os admins da agência
- prisma/seed.ts: cria agência ROI Labs + admin inicial (npm run db:seed)

✅ FASE 1 — Sprint 4 (CONCLUÍDO)
- lib/crypto.ts: AES-256-GCM encrypt/decrypt/safeDecrypt
- OAuth Meta: GET /api/oauth/meta + /api/oauth/meta/callback (token longa duração → DB criptografado)
- OAuth Google: GET /api/oauth/google + /api/oauth/google/callback (Ads + Analytics)
- DELETE /api/onboarding/[token]/connections (desconectar plataforma)
- /onboarding/[token]/platforms: status real de conexão + botões Conectar/Desconectar
- lib/auth.ts: signOAuthState + verifyOAuthState (OAuth state tamper-proof)
- vercel.json + build script com prisma generate
- E2E: Playwright config + e2e/smoke.spec.ts

🏁 FASE 1 CONCLUÍDA
```

---

## FASE 1 — MVP Funcional
**Objetivo:** Primeira agência real usando o produto (pode ser interna)
**Critério de saída:** Um cliente completa o onboarding de ponta a ponta sem intervenção manual

---

### ✅ Sprint 1 — Fundação do Backend (Semana 1-2) — CONCLUÍDO
**Meta:** Banco, auth e modelo de dados funcionando

| Tarefa | Detalhes |
|---|---|
| Configurar PostgreSQL | Prisma + schema inicial |
| Schema: Agency, Client, Onboarding, Step | Modelo multitenant desde o início |
| Magic link auth | Resend → gera token → valida → session JWT |
| Rota: POST /api/onboarding/start | Agência cria novo onboarding |
| Rota: GET /api/onboarding/:token | Cliente acessa pelo link |
| Middleware de auth | Proteger rotas de admin |

**Schema inicial:**
```sql
Agency        (id, name, slug, logo_url, created_at)
Client        (id, agency_id, name, email, company, created_at)
Onboarding    (id, client_id, token, status, current_step, completed_at)
OnboardingStep(id, onboarding_id, step_number, data, completed_at)
MagicLink     (id, client_id, token, expires_at, used_at)
```

**Go/No-Go:** Magic link funciona de ponta a ponta (cliente recebe e-mail → acessa onboarding)

---

### ✅ Sprint 2 — Fluxo do Cliente (Semana 3-4) — CONCLUÍDO
**Meta:** Cliente consegue completar os 4 steps e salvar os dados

| Tarefa | Detalhes |
|---|---|
| Step 1: Dados da empresa | Form com validação + save no DB |
| Step 2: Upload de assets | Upload para Cloudflare R2 + lista de arquivos |
| Auto-save por step | Salva ao avançar + retoma de onde parou |
| Barra de progresso dinâmica | Atualiza conforme steps completados |
| Step 4: Briefing | Formulário dinâmico com campos condicionais |
| Página de conclusão | "Seu onboarding está completo!" |

**Decisões técnicas:**
- Upload: presigned URL do R2 (cliente faz upload direto, sem passar pelo servidor)
- Estado do formulário: salvo por step (não por campo)
- Token do link: UUID v4, expira em 7 dias, single-use por sessão

**Go/No-Go:** Agência interna usa com 1 cliente real e coleta feedback

---

### ✅ Sprint 3 — Painel da Agência + Notificações (Semana 5-6) — CONCLUÍDO
**Meta:** Agência consegue gerenciar clientes sem acessar o banco diretamente

| Tarefa | Detalhes |
|---|---|
| /admin funcional | Listar clientes com status real do DB |
| Criar novo onboarding | Form na UI → gera link único → copia para clipboard |
| Ver detalhe do cliente | Todos os dados respondidos em uma tela |
| Download de assets | Links assinados do R2 para download |
| Notificação por e-mail | Resend: agência recebe e-mail quando cliente conclui |
| Auth da agência | Login com senha para equipe interna |

**Go/No-Go:** Agência usa o painel diariamente sem pedir ajuda técnica

---

### ✅ Sprint 4 — Estabilização + Step 3 OAuth (Semana 7-8) — CONCLUÍDO
**Meta:** Conexão OAuth funcional com Meta e Google

| Tarefa | Detalhes |
|---|---|
| OAuth Meta Business | App registrada + fluxo de permissão + salvar token |
| OAuth Google | Google Ads + Analytics |
| Salvar tokens de forma segura | Criptografados no DB (não em plaintext) |
| Tela de status das conexões | Cliente vê o que está conectado |
| Testes E2E do fluxo completo | Playwright: login → steps → conclusão |
| Deploy em produção | Vercel + domínio próprio |

**Go/No-Go (Fase 1):** 3 clientes reais concluíram o onboarding. Tempo < 48h. Zero intervenção manual da equipe.

---

## FASE 2 — Produto Vendável
**Objetivo:** Cobrar as primeiras agências externas
**Critério de saída:** 5 agências pagantes, MRR > R$ 3.000

---

### ✅ Sprint 5 — White-label + Multi-agência (Semana 9-10) — CONCLUÍDO

| Tarefa | Detalhes |
|---|---|
| Cadastro de agência | POST /api/agency/signup + /signup page pública |
| White-label básico | /admin/settings: logo URL + cor primária com preview |
| Portal white-label | Sidebar e header do cliente usam logo/cor da agência |
| Admin branding | Header do admin reflete logo e cor da agência |
| Link "Criar conta" na login | /admin/login → /signup |
| Subdomínio por agência | Diferido — requer domínio vertice.app + wildcard DNS |
| Domínio customizado | Diferido — Sprint 7+ |
| Isolamento de dados | agencyId em todas as queries (multitenant por app) |

---

### Sprint 6 — Automações (Semana 11-12)

| Tarefa | Detalhes |
|---|---|
| Auto-chase | Lembrete automático para cliente parado > 48h |
| Notificações WhatsApp | Evolution API: alerta para equipe |
| Google Drive integration | Criar pasta do cliente ao iniciar onboarding |
| Webhook customizável | Agência configura URL para receber eventos |

---

### Sprint 7 — IA e Analytics (Semana 13-14)

| Tarefa | Detalhes |
|---|---|
| Análise de briefing por IA | Claude API: briefing → documento de marca |
| Dashboard de analytics | Taxa de conclusão, tempo médio, abandono por step |
| Templates de onboarding | Agência salva e reutiliza fluxos |
| Exportar relatório do cliente | PDF com todos os dados coletados |

---

### Sprint 8 — Billing + Launch (Semana 15-16)

| Tarefa | Detalhes |
|---|---|
| Stripe integration | Planos mensais com trial de 14 dias |
| Página de pricing pública | Planos Starter / Pro / Agency |
| Onboarding da própria agência | Tour guiado ao criar conta |
| Landing page com SEO | Blog + casos de uso |

**Go/No-Go (Fase 2):** 5 agências pagantes, churn < 10% no primeiro mês.

---

## FASE 3 — Escala
**Horizonte:** Mês 7-12

| Initiative | Descrição |
|---|---|
| Marketplace de templates | Comprar/vender fluxos de onboarding |
| Assinatura digital integrada | Assinar contrato no próprio portal |
| API pública | Agências integram com seus próprios sistemas |
| Mobile responsivo aprimorado | Otimização para cliente que acessa pelo celular |
| ClickUp / Notion / Trello | Criar projeto automaticamente ao concluir |
| Relatórios de performance | Cruzar dados de onboarding com resultados da campanha |

---

## Critérios Go/No-Go por Fase

| Fase | Critério |
|---|---|
| Fim Fase 1 | 3 clientes reais concluídos, zero intervenção manual |
| Fim Fase 2 | 5 agências pagantes, MRR > R$ 3k, churn < 10% |
| Fim Fase 3 | 30 agências, MRR > R$ 25k, NPS > 60 |

---

## O que NÃO fazer em cada fase

| Fase | Evitar |
|---|---|
| Fase 1 | White-label, billing, marketplace, mobile app |
| Fase 2 | API pública, assinatura digital, features sem demanda comprovada |
| Fase 3 | Entrar em verticais fora de agências de marketing |
