# Vértice — Stack Técnica e Decisões de Arquitetura

## Stack Atual (Fase 1)

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack em um repo, deploy simples na Vercel, familiaridade da equipe |
| Linguagem | TypeScript | Segurança de tipos, refatoração segura, menos bugs em runtime |
| Estilo | Tailwind CSS v4 | Velocidade de desenvolvimento, design system via CSS variables |
| Banco de Dados | PostgreSQL | Relacional, confiável, suporta multitenant via Row-Level Security |
| ORM | Prisma | Type-safe, migrations, integração nativa com Next.js |
| Auth | Magic link (JWT) | Zero atrito para o cliente — não precisa criar senha |
| Storage | Cloudflare R2 | Sem egress fees, S3-compatible, barato para arquivos grandes |
| E-mail | Resend | API simples, boa deliverability, SDK TypeScript oficial |
| Deploy | Vercel | Zero-config para Next.js, preview deployments, edge functions |

---

## Arquitetura do Banco (Fase 1)

```prisma
model Agency {
  id         String   @id @default(cuid())
  name       String
  slug       String   @unique
  logoUrl    String?
  primaryColor String  @default("#135bec")
  createdAt  DateTime @default(now())
  clients    Client[]
  users      AgencyUser[]
}

model AgencyUser {
  id        String   @id @default(cuid())
  agencyId  String
  email     String
  name      String
  role      String   @default("member") // "owner" | "member"
  agency    Agency   @relation(fields: [agencyId], references: [id])
}

model Client {
  id           String       @id @default(cuid())
  agencyId     String
  name         String
  email        String
  company      String?
  createdAt    DateTime     @default(now())
  agency       Agency       @relation(fields: [agencyId], references: [id])
  onboardings  Onboarding[]
}

model Onboarding {
  id           String           @id @default(cuid())
  clientId     String
  token        String           @unique @default(cuid())
  status       String           @default("pending") // pending | in_progress | completed
  currentStep  Int              @default(0)
  completedAt  DateTime?
  createdAt    DateTime         @default(now())
  client       Client           @relation(fields: [clientId], references: [id])
  steps        OnboardingStep[]
  magicLinks   MagicLink[]
}

model OnboardingStep {
  id           String     @id @default(cuid())
  onboardingId String
  stepNumber   Int        // 1=company, 2=assets, 3=platforms, 4=briefing
  data         Json?      // dados do step salvo
  completedAt  DateTime?
  onboarding   Onboarding @relation(fields: [onboardingId], references: [id])

  @@unique([onboardingId, stepNumber])
}

model MagicLink {
  id           String     @id @default(cuid())
  onboardingId String
  token        String     @unique @default(cuid())
  email        String
  expiresAt    DateTime
  usedAt       DateTime?
  onboarding   Onboarding @relation(fields: [onboardingId], references: [id])
}

model AssetUpload {
  id           String   @id @default(cuid())
  onboardingId String
  fileName     String
  fileSize     Int
  fileType     String
  r2Key        String   // chave no Cloudflare R2
  uploadedAt   DateTime @default(now())
}

model PlatformConnection {
  id           String   @id @default(cuid())
  onboardingId String
  platform     String   // "meta" | "google_ads" | "google_analytics" | "wordpress"
  accessToken  String   // criptografado
  refreshToken String?  // criptografado
  expiresAt    DateTime?
  connectedAt  DateTime @default(now())
}
```

---

## API Routes (Next.js)

### Rotas Públicas (cliente)
```
POST /api/auth/magic-link          → Gera e envia magic link
GET  /api/auth/verify?token=...    → Valida token, retorna JWT de sessão
GET  /api/onboarding/:token        → Dados do onboarding (step atual, cliente)
PUT  /api/onboarding/:token/step   → Salva dados de um step
POST /api/onboarding/:token/upload → Retorna presigned URL para upload no R2
GET  /api/onboarding/:token/status → Status atual (para retomada)
```

### Rotas da Agência (autenticadas)
```
POST /api/agency/onboardings         → Cria novo onboarding (gera link)
GET  /api/agency/onboardings         → Lista todos com status
GET  /api/agency/onboardings/:id     → Detalhes de um cliente
GET  /api/agency/onboardings/:id/assets → Assets com links assinados
POST /api/agency/onboardings/:id/nudge  → Envia lembrete para cliente
```

---

## Segurança

| Ponto | Solução |
|---|---|
| Tokens de plataforma (OAuth) | Criptografados com AES-256 antes de salvar no DB |
| Magic links | Expiram em 7 dias, invalidados após uso |
| Uploads | Presigned URLs com expiração de 15 minutos |
| Acesso entre agências | Middleware valida agencyId em toda rota autenticada |
| Variáveis de ambiente | Nunca commitadas — .env.local + Vercel Env |

---

## Decisões Adiadas (não para o MVP)

| Decisão | Quando revisar |
|---|---|
| FastAPI para backend pesado | Sprint 7+ se processamento de IA ficar lento |
| Redis para filas | Sprint 6 se auto-chase precisar de jobs assíncronos |
| Separar banco por agência (schema isolation) | Fase 3 se requisitos de compliance aparecerem |
| Kubernetes / containers | Só se Vercel deixar de ser suficiente |
| React Native / mobile app | Fase 3, se clientes pedirem |

---

## Variáveis de Ambiente Necessárias

```env
# Banco
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=...
NEXTAUTH_URL=https://app.vertice.com.br

# E-mail
RESEND_API_KEY=...
FROM_EMAIL=onboarding@vertice.com.br

# Cloudflare R2
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=vertice-uploads
R2_PUBLIC_URL=https://uploads.vertice.com.br

# OAuth Meta
META_APP_ID=...
META_APP_SECRET=...

# OAuth Google
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# IA (Fase 2)
ANTHROPIC_API_KEY=...

# Criptografia de tokens
ENCRYPTION_KEY=...
```

---

## Estrutura de Pastas (App Router)

```
app/
├── (public)/
│   ├── page.tsx                    → Landing
│   └── login/page.tsx              → Magic link form
├── (client)/
│   └── onboarding/
│       ├── [token]/
│       │   ├── layout.tsx          → Sidebar com steps
│       │   ├── page.tsx            → Redirect para step atual
│       │   ├── company/page.tsx    → Step 1
│       │   ├── brand-assets/page.tsx → Step 2
│       │   ├── platforms/page.tsx  → Step 3
│       │   └── briefing/page.tsx   → Step 4
│       └── complete/page.tsx       → Tela de conclusão
├── (agency)/
│   └── admin/
│       ├── layout.tsx              → Sidebar da agência
│       ├── page.tsx                → Dashboard
│       └── clients/[id]/page.tsx   → Detalhe do cliente
└── api/
    ├── auth/
    │   ├── magic-link/route.ts
    │   └── verify/route.ts
    ├── onboarding/
    │   └── [token]/
    │       ├── route.ts
    │       ├── step/route.ts
    │       └── upload/route.ts
    └── agency/
        └── onboardings/
            ├── route.ts
            └── [id]/
                ├── route.ts
                └── assets/route.ts

lib/
├── prisma.ts         → Singleton do Prisma
├── auth.ts           → JWT helpers
├── r2.ts             → Cloudflare R2 helpers
├── resend.ts         → E-mail helpers
└── crypto.ts         → Criptografia de tokens OAuth
```
