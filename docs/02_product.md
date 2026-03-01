# Vértice — Especificação do Produto

## Visão Geral de Fases

```
FASE 1 — MVP (0-3 meses)       → Validar com uso interno + beta fechado
FASE 2 — Growth (3-6 meses)    → Primeiros clientes pagantes
FASE 3 — Scale (6-12 meses)    → Automação avançada + IA + marketplace
```

---

## FASE 1 — MVP

> Objetivo: um cliente real consegue completar o onboarding do início ao fim sem ajuda da agência.

### Portal do Cliente (White-label)

| Feature | Descrição | Prioridade |
|---|---|---|
| Magic link auth | Cliente acessa via e-mail, sem criar senha | P0 |
| Step 1: Dados da Empresa | Nome, CNPJ, segmento, contato | P0 |
| Step 2: Identidade Visual | Upload de logo, manual de marca, fotos | P0 |
| Step 3: Acessos | Conexão OAuth com Meta + Google | P0 |
| Step 4: Briefing | Formulário dinâmico (público-alvo, concorrentes, tom de voz) | P0 |
| Auto-save | Retomar de onde parou se fechar a aba | P0 |
| Barra de progresso | Cliente vê exatamente em qual etapa está | P1 |
| Vídeos guia | Explicação em vídeo embutida em cada etapa | P2 |

### Painel da Agência (Admin)

| Feature | Descrição | Prioridade |
|---|---|---|
| Lista de clientes | Ver todos os onboardings ativos | P0 |
| Barra de progresso por cliente | Qual etapa está travado | P0 |
| Download de assets | Acessar arquivos enviados pelo cliente | P0 |
| Notificação de conclusão | Alerta quando cliente finaliza 100% | P0 |
| Criar novo onboarding | Gerar link único para um novo cliente | P0 |
| Ver detalhes do cliente | Todos os dados e respostas em uma tela | P1 |
| Enviar lembrete manual | Nudge para cliente parado | P1 |

### Infraestrutura MVP

| Item | Decisão |
|---|---|
| Auth | Magic link via e-mail (Resend) |
| Storage | Cloudflare R2 para uploads |
| DB | PostgreSQL via Prisma |
| Backend | Next.js API Routes (sem FastAPI no MVP) |
| Deploy | Vercel |
| Notificações | E-mail via Resend |

> **Decisão MVP:** manter tudo em Next.js para velocidade. FastAPI entra na Fase 2 se necessário.

---

## FASE 2 — Growth

> Objetivo: agência consegue configurar e personalizar o produto sem depender do dev.

### Novas Features

| Feature | Descrição |
|---|---|
| White-label completo | Agência configura logo, cores, domínio próprio |
| Templates de onboarding | Biblioteca de modelos por tipo de agência |
| Notificações WhatsApp | Webhook → Evolution API / Zap |
| Auto-chase | Lembretes automáticos para cliente parado > N dias |
| Setup interno automático | Criar pasta no Drive + projeto no ClickUp após conclusão |
| IA — Análise de Briefing | Gera documento de Tom de Voz + Personas via LLM |
| Multi-agência | Plataforma multitenant (uma conta por agência) |
| Onboarding Analytics | Taxa de conclusão, tempo médio, etapa com maior abandono |

### Integrações Fase 2

| Integração | Finalidade |
|---|---|
| Google Drive API | Criar pastas e mover arquivos automaticamente |
| ClickUp API | Criar projeto e tarefas ao concluir onboarding |
| Evolution API (WhatsApp) | Notificações e lembretes via WhatsApp |
| Meta OAuth | Conexão segura com Business Manager |
| Google OAuth | Conexão com Google Ads e Analytics |
| Resend | E-mails transacionais |

---

## FASE 3 — Scale

> Objetivo: produto vende e expande com mínima intervenção humana.

### Novas Features

| Feature | Descrição |
|---|---|
| Marketplace de templates | Agências vendem/compartilham seus templates de onboarding |
| IA — Análise de fit | Avalia briefing e sugere serviços adicionais para a agência |
| Assinatura digital | Assinar contrato dentro do próprio onboarding |
| Client portal pós-onboarding | Área do cliente para ver relatórios e aprovações |
| API pública | Agências integrarem o Vértice em seus próprios sistemas |
| SSO | Login com Google/Microsoft para equipes |
| Auditoria | Log de todas as ações do cliente e da equipe |

---

## O que NUNCA entra no MVP

- Dashboard de relatórios de campanha (não é o foco)
- CRM completo (existem ferramentas melhores)
- Gestão financeira / faturamento (fora do escopo)
- App mobile nativo (web responsivo é suficiente)

---

## Fluxo Principal (Happy Path)

```
Agência cria onboarding → Sistema gera link único
    ↓
Agência envia link para cliente (WhatsApp / e-mail)
    ↓
Cliente clica → Acessa com magic link
    ↓
Step 1: Dados da empresa     [5 min]
Step 2: Upload de assets     [10 min]
Step 3: Conexões OAuth       [5 min]
Step 4: Briefing estratégico [15 min]
    ↓
Conclusão → Agência recebe notificação
    ↓
IA processa briefing → Documento de marca gerado
    ↓
Equipe começa a trabalhar
```

**Tempo total do cliente: ~35 minutos → Meta: < 30 minutos**
