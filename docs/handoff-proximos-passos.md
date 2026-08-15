# Handoff — próximos passos do Vértice

**Escrito em:** 2026-08-15, ao fim da sessão de recuperação de produção
**Estado:** produção no ar e verificada; produto tecnicamente vivo, comercialmente inutilizável até as chaves de terceiros entrarem

---

## 1. Onde o projeto está agora (medido, não documental)

Tudo abaixo foi verificado por `curl` contra produção em 15/08, não lido de doc:

| O que | Resultado |
|---|---|
| `/api/health` | `200` — `{"status":"healthy","db":"ok"}` |
| `/signup` cria conta de verdade | **Sim** — `POST /api/agency/signup` → `{"ok":true}`, e a conta criada autentica em seguida (`200`) |
| `/admin/login` autentica | `200`, cookie `vertice_session` assinado com JWT real |
| Âncoras `href="#"` na home | **zero** |
| `/sitemap.xml` e `/robots.txt` | `200` nos dois |
| Migrations no banco de produção | 8/8 aplicadas |

A pergunta que estava aberta desde julho — *"o /signup cria conta de verdade ou isso é landing sem backend?"* — **está respondida: é SaaS de verdade e o cadastro funciona de ponta a ponta.** A conta de teste usada na medição foi criada e removida do banco; produção tem só a agência ROI Labs.

---

## 2. O bloqueio real: o produto está no ar e ninguém consegue usar

Esta é a coisa mais importante deste documento.

O cliente da agência entra no portal **exclusivamente pelo magic link enviado por e-mail** (`POST /api/auth/magic-link` → `lib/resend.ts` → Resend). Não existe segunda porta: nem senha, nem link direto, nem convite manual pelo painel.

`RESEND_API_KEY` não está configurada em produção. Consequência: **nenhum cliente consegue entrar no onboarding hoje**, por mais que o SaaS responda 200 em tudo. A agência consegue criar o onboarding e gerar o token; o cliente nunca recebe o link para usá-lo.

Isso torna o Resend o primeiro passo, acima de qualquer outra integração — todas as outras só têm efeito depois que existe um cliente dentro do fluxo.

---

## 3. Armadilha já desarmada (não repita)

`NEXT_PUBLIC_APP_URL` monta a URL dentro do e-mail do magic link. Ela **não estava setada**, e o fallback no código é `http://localhost:3000` — ou seja, se o `RESEND_API_KEY` tivesse sido colado sem mais nada, todo cliente teria recebido um link apontando para o localhost dele. Já configurei `NEXT_PUBLIC_APP_URL=https://vertice.roilabs.com.br` em produção.

**`NEXT_PUBLIC_BASE_DOMAIN` deve continuar VAZIA.** Quando ela está preenchida, `lib/resend.ts:225-227` passa a montar o link como `https://{slug-da-agência}.{BASE_DOMAIN}` — e não existe DNS wildcard: `roi-labs.vertice.roilabs.com.br` não resolve (testado em 15/08). Preencher essa variável antes de configurar o wildcard na Vercel + DNS quebra o magic link de novo, silenciosamente. Só preencha junto com o wildcard.

---

## 4. O que falta, em ordem de impacto

Cada bloco é uma conta de terceiro que só o Jean pode criar. O código já está pronto e esperando a variável.

### 1º — Resend (destrava o produto inteiro)
```
RESEND_API_KEY=
RESEND_FROM=          # precisa ser de um domínio verificado no Resend
```
Sem isso: nenhum cliente entra no onboarding. Também derruba o formulário de `/contato`, o e-mail de conclusão e o auto-chase.
**Como validar:** criar um onboarding no painel, disparar o link e confirmar que o e-mail chega e abre o portal.

### 2º — Cloudflare R2 (destrava a etapa 2 de 4)
```
R2_ACCOUNT_ID=  R2_ACCESS_KEY_ID=  R2_SECRET_ACCESS_KEY=  R2_BUCKET_NAME=  R2_PUBLIC_URL=
```
Sem isso a etapa `brand-assets` não sobe arquivo — o cliente trava no meio do fluxo. Há um `scripts/set-r2-cors.ts` no repo para o CORS do bucket.

### 3º — OAuth Meta + Google (destrava a etapa 3 de 4)
```
META_APP_ID=  META_APP_SECRET=
GOOGLE_CLIENT_ID=  GOOGLE_CLIENT_SECRET=
```
Sem isso a etapa `platforms` não conecta nada. Os callbacks já existem em `/api/oauth/*`; falta registrar as URLs de redirect nos apps da Meta e do Google.

### 4º — Anthropic (destrava o diferencial do plano Pro)
```
ANTHROPIC_API_KEY=
```
É o que faz o `analyzeBriefing()` rodar. O modelo já foi atualizado para `claude-sonnet-5`. A análise por IA é justamente o que o `/precos` vende como exclusividade do Pro (R$ 197) — sem a chave, o plano Pro não entrega o que a página promete.

### 5º — Automações de conclusão (opcional para o primeiro cliente)
```
GOOGLE_SA_EMAIL=  GOOGLE_SA_PRIVATE_KEY=  GOOGLE_DRIVE_PARENT_ID=
EVOLUTION_API_URL=  EVOLUTION_API_KEY=  EVOLUTION_INSTANCE=
```
Pasta no Drive e aviso por WhatsApp ao concluir. O onboarding completa sem elas.

### 6º — Mercado Pago (destrava cobrar)
```
MP_ACCESS_TOKEN=  MP_WEBHOOK_SECRET=
MP_PLAN_STARTER_ID=c696c00ae61a40748b010c83d2ae4f5f
MP_PLAN_PRO_ID=3c72932f00334ee28d5f98862f2926d6
MP_PLAN_AGENCY_ID=38550466d48f462cb4fd34f20c819db0
```
Os IDs de plano já estão no roadmap; faltam o token e o segredo de webhook. Fica por último de propósito: o trial é de 14 dias, então dá para ter agência usando antes de a cobrança existir.

---

## 5. Já configurado em produção (não precisa mexer)

`DATABASE_URL` · `JWT_SECRET` · `ENCRYPTION_KEY` · `CRON_SECRET` · `NEXT_PUBLIC_APP_URL`

`JWT_SECRET`, `ENCRYPTION_KEY` e `CRON_SECRET` foram gerados nesta sessão. O `JWT_SECRET` era urgente: o código tinha o fallback `"dev-secret-change-in-production"` embutido em `lib/auth.ts`, ou seja, com o banco funcionando qualquer pessoa que lesse o repositório público conseguiria forjar sessão de qualquer agência ou cliente. Está fechado.

**A senha do admin (`admin@roi-labs.com`) foi gerada nesta sessão e entregue no chat — não está neste arquivo nem em nenhum arquivo versionado, de propósito.** Troque em `/admin/settings` no primeiro login. Se a perdeu, rode o seed de novo com `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` (o seed atualiza a senha de um admin já existente).

---

## 6. Ordem recomendada

1. Colar `RESEND_API_KEY` + `RESEND_FROM` → o produto passa a ser usável.
2. Rodar o fluxo do cliente de ponta a ponta você mesmo, como se fosse um cliente da agência: criar onboarding, receber o e-mail, preencher as 4 etapas. É o teste de aceitação real, e vai mostrar exatamente onde R2/OAuth derrubam o fluxo.
3. Colar R2 e OAuth conforme o passo 2 acusar.
4. Colar `ANTHROPIC_API_KEY` e gerar uma análise de briefing de verdade.
5. Só então Mercado Pago — e aí buscar a primeira agência.

O smoke E2E (`npm run test:e2e`) cobre login da agência, criação de onboarding e navegação do cliente. Ele agora exige `TEST_ADMIN_EMAIL` e `TEST_ADMIN_PASS` no ambiente (não há mais credencial default).

---

## 7. Armadilhas do repositório (herdadas, ainda valem)

1. **Rotas dinâmicas no Next 16:** `params` é `Promise<{...}>` e precisa de `await`. Tipar como objeto síncrono dá 404 silencioso em produção — foi o que quebrou o post do blog.
2. **`npm run build` reescreve `app/tsconfig.json`** toda vez. Rodar `git checkout -- app/tsconfig.json` antes do `git add`.
3. **`vercel deploy --prod` rodado de dentro de `app/` falha** com `ENOENT app/app/package.json`: o Root Directory do projeto na Vercel já é `app`, então subir `app/` como fonte duplica o nível. Deploy correto é por `git push` na `main`, que resolve o root sozinho.
4. **Deploy leva 1-2 min** para propagar — testar a URL real, não confiar no push.
