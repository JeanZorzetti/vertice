# Handoff — Vértice

**Escrito em:** 2026-09-04 (substitui o handoff de 2026-08-15, cujas pendências foram resolvidas ou migraram)
**Estado:** produção no ar; páginas legais auditadas e corrigidas; **cinco pendências abertas**, as três primeiras de infraestrutura e a primeira delas urgente.

> ⚠️ **Este repositório é público.** Nenhuma senha, IP, porta ou credencial de produção entra em arquivo versionado — nem neste. Onde este documento precisa apontar para um valor sensível, ele diz *onde* encontrá-lo (Vercel / painel do VPS), nunca o valor.

---

## Pendências abertas, em ordem de urgência

### 1. 🔴 Senha do banco de produção — TROCAR

Em 03/09/2026 a `DATABASE_URL` de produção, com a senha em texto puro, foi colada num chat. Trate como vazada.

**O que fazer:** gerar senha nova no painel onde o Postgres roda → atualizar a `DATABASE_URL` no dashboard da Vercel (projeto `vertice` → Settings → Environment Variables) → redeploy.

Enquanto não for trocada, a senha antiga continua sendo a única barreira do banco (ver item 2).

### 2. 🔴 Conexão com o banco sem TLS e porta sem firewall

A `DATABASE_URL` de produção termina em `sslmode=disable`: **todo o tráfego entre a Vercel e o banco viaja sem criptografia**, incluindo dados pessoais dos clientes finais das agências.

Medido em 03/09: a porta do Postgres respondeu a partir de uma conexão residencial qualquer — ou seja, o banco está exposto à internet aberta, sem firewall, e a senha é a única barreira. (Coordenadas de propósito fora deste arquivo; estão na env var da Vercel.)

Isso também contradiz o que `app/app/seguranca/page.tsx` promete hoje: *"Toda comunicação com o Vértice usa HTTPS/TLS"* — verdadeiro entre navegador e site, falso entre site e banco.

**Ordem de correção:**
1. Trocar a senha (item 1).
2. Trocar `sslmode=disable` por `sslmode=require` na Vercel. Se a conexão quebrar, é porque o servidor Postgres não tem certificado TLS configurado — aí o passo é configurar TLS nele.
3. **Correção definitiva:** migrar para um Postgres gerenciado (Neon ou Supabase, ambos com plano gratuito). TLS obrigatório, backup automático e sem porta exposta — resolve os itens 1, 2 e 3 de uma vez.

### 3. 🟡 Backup do banco: provavelmente não existe — e a página de segurança afirma que existe

O banco é **self-hosted num VPS**, não é serviço gerenciado. Banco self-hosted não faz backup sozinho: só existe se alguém agendou.

`app/app/seguranca/page.tsx` afirma *"O banco de dados de produção passa por backups automáticos regulares"*. Se não houver agendamento configurado, **essa frase é falsa** — o mesmo tipo de erro (afirmar recurso inexistente na página de confiança) que foi corrigido no commit `c2a3a14`.

**Como verificar:** painel do VPS → serviço do Postgres → aba **Backups**.

**Decisão pendente:** se não houver backup agendado, a frase sai da página (correção de 2 minutos) e o backup é configurado depois. Não deixar a frase no ar "até configurar".

### 4. 🟡 Página de segurança sem números reais

Bloqueada pelas respostas dos itens acima. Três lacunas em `app/app/seguranca/page.tsx`:

- **"backups automáticos regulares"** → precisa de frequência e retenção reais (ex.: "backup diário, retenção de 30 dias"), ou sai.
- **Controle de acesso** → hoje diz apenas "restrito à equipe responsável", sem mencionar verificação em duas etapas. Checklist a confirmar, em ordem de impacto: **GitHub** (push na `main` = deploy, é o acesso mais crítico), **Vercel**, **painel do VPS**, **Cloudflare**, **Stripe**, **Brevo**.
- **Disponibilidade** → não existe página de status. `/api/health` já funciona e responde `{"status":"healthy","db":"ok"}` (verificado em 03/09); falta apenas um monitor externo apontado para ela — UptimeRobot no plano gratuito monitora e já gera a página pública de status. Depois de ~30 dias rodando, existe um número de uptime real para citar.

Regra que vale para as três: **onde não houver número real, apagar a frase é mais honesto do que deixá-la vaga.**

### 5. 🟡 Lacunas jurídicas nas páginas legais

Levantadas na auditoria de `docs/design-review-paginas-legais.md` e deixadas em aberto de propósito — decisão explícita de 02/09: isto **não** deve receber texto redigido por IA.

- **Encarregado (DPO) não nomeado.** A LGPD (art. 41) exige indicar um responsável pelos dados e publicar o contato. `/privacidade` cita os direitos do titular (art. 17–22) mas não nomeia ninguém. Não precisa ser advogado nem ter certificação — em empresa pequena costuma ser um sócio. Falta nome + e-mail de contato.
- **Sem CNPJ nem razão social** em nenhuma página. Os Termos de Uso são um contrato de adesão e hoje não identificam a contraparte.

Assim que os dados reais existirem, escrevê-los nas páginas é transcrição, não redação jurídica — trabalho de minutos. O que continua merecendo revisão de advogado é o corpo dos Termos (limitação de responsabilidade, reembolso, rescisão).

---

## Feito nesta rodada (2026-09-02 → 04)

- **Auditoria multi-disciplinar** de `/seguranca`, `/termos` e `/privacidade` — as três páginas que o design review de 31/08 (`docs/design-review-site-publico.md`) tinha deixado de fora. Resultado em `docs/design-review-paginas-legais.md`: 9 ações medidas contra produção via Playwright (3 páginas × 3 larguras + passagem profunda a 1440).
- **Corrigido e pushado em `c2a3a14`:** integrações fantasmas removidas (a página de segurança e a política de privacidade afirmavam OAuth com HubSpot, Slack e Asana — nenhum existe em `app/lib/`); Stripe separado das integrações que a agência ativa (é o gateway de cobrança do próprio Vértice); `aria-hidden` nos ícones de `/seguranca`; hierarquia de headings H3→H2; links reais entre as três páginas legais; sumário com âncoras em termos e privacidade; cores hardcoded trocadas pelos tokens de `globals.css`; ano do copyright do rodapé agora é dinâmico.
- **Migração Stripe** (`a484ed0`) enviada a origin em 02/09, com a migração de banco rodada antes pela Maria. Produção respondeu 200 em `/`, `/signup` e `/seguranca` depois do deploy. Não foi possível confirmar por aqui que o `prisma migrate deploy` rodou de fato (sem credencial de banco local) — se `/signup` ou o billing derem erro de coluna inexistente, é o primeiro lugar a checar.

---

## Achados fora de escopo, ainda abertos

- **`app/app/signup/page.tsx`** mostra `vertice.app/` como prefixo do slug da agência no formulário de cadastro; produção é `vertice.roilabs.com.br`.
- **`SiteFooter.tsx` usa `H4`** para as colunas do rodapé, pulando nível de heading em todo o site. Correção sitewide de baixa prioridade.
- **Cores hardcoded** ainda existem nas outras 8 páginas públicas e no rodapé (as 3 páginas legais já foram convertidas para os tokens).
- **Retenção de 90 dias** prometida em `/privacidade` — nunca foi verificado se existe rotina de expurgo que a cumpra.
- **E-mail transacional migrou de Resend para Brevo** (`lib/brevo.ts`, commit `f4b9fd1`). O handoff antigo listava `RESEND_API_KEY` como pendência; hoje a variável equivalente é `BREVO_API_KEY` / `BREVO_FROM`. Confirmar que estão configuradas em produção testando o formulário de `/contato` de verdade.

---

## Armadilhas do repositório (herdadas, ainda valem)

1. **Repositório público.** Nada de credencial, IP ou porta de produção em arquivo versionado.
2. **Rotas dinâmicas no Next 16:** `params` é `Promise<{...}>` e precisa de `await`. Tipar como objeto síncrono dá 404 silencioso em produção — foi o que quebrou o post do blog em agosto.
3. **`npm run build` reescreve `app/tsconfig.json`** toda vez. Rodar `git checkout -- app/tsconfig.json` antes do `git add` para não sujar o commit.
4. **`vercel deploy --prod` rodado de dentro de `app/` falha** com `ENOENT app/app/package.json`: o Root Directory do projeto na Vercel já é `app`. Deploy correto é `git push` na `main`.
5. **O deploy leva 1–2 min** para propagar — testar a URL real, não confiar no push.
6. **`prisma migrate deploy` não roda no deploy.** O `build` é `prisma generate && next build`. Toda migração precisa ser aplicada à mão no banco de produção **antes** do push, senão o site sobe com o schema errado.
7. **Sem `.env` local** neste clone (só `.env.example`) — nenhuma credencial verificável pela máquina de desenvolvimento.
8. **`git commit` avisa `LF will be replaced by CRLF`** — autocrlf do Git no Windows, inofensivo.

---

## Entregas anteriores (referência)

- **2026-09-02→04:** auditoria e correção das páginas legais (`c2a3a14`).
- **2026-09-01:** migração da cobrança de Mercado Pago para Stripe (`a484ed0`).
- **2026-08-31:** design review do site público de marketing (`b7d9f45`), 10 ações.
- **2026-08-15:** fix do 404 no post do blog (`ef612fe`), página 404 customizada (`4905117`), recuperação de produção — `JWT_SECRET`, `ENCRYPTION_KEY`, `CRON_SECRET` e `NEXT_PUBLIC_APP_URL` gerados e configurados.
- **Anterior:** 8 páginas de marketing criadas (`a22458b`, `d41aa25`, `5eb54ca`, `756f6f7`).

Para o roteiro de chaves de terceiros que ainda faltam (R2, OAuth Meta/Google, Anthropic, Stripe em produção), ver `docs/handoff-proximos-passos.md`.
