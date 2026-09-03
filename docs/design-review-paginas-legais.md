# Design Review — Páginas Legais do Vértice

**Data:** 2026-09-02
**Alvo:** `/seguranca`, `/termos`, `/privacidade`
**Objetivo do usuário na superfície:** um dono de agência decidindo se confia dados de cliente ao Vértice (segurança) e entendendo o que está assinando (termos/privacidade) — não é superfície de conversão direta como a home, é superfície de confiança.
**Restrição:** Next 16 + Tailwind 4, tokens já fixados em `app/globals.css`, produção viva em `vertice.roilabs.com.br`, deploy só por push na `main`. Esta é uma auditoria **read-only** — nenhum arquivo de código foi alterado.

**Disciplinas rodadas:** `conversion-copy` → `behavioral-design` → `art-direction` → `motion-design` → `seo-geo` → `responsive-design` → `web-performance` → `accessibility` → `ui-verification`

**Método de verificação:** Playwright local (script ad hoc em Node, `chromium.launch`) contra produção — o MCP do Playwright não conecta nesta máquina. 3 páginas × 3 larguras (360/768/1440): status HTTP, LCP, console errors, requisições falhas, overflow horizontal, screenshot full-page. Mais uma passagem profunda a 1440 em cada página: metadata (title/description/OG/twitter/canonical), hierarquia de headings, nomes acessíveis de elementos interativos, ordem de Tab (15 tabs), landmarks, `application/ld+json`. Screenshots e o JSON bruto das 9 combinações + passagem profunda ficam em `C:\Users\dudin\AppData\Local\Temp\claude\c--Users-dudin-Desktop-Pasta-das-empresa\f9f19ab0-b387-4688-bfac-02d683ced841\scratchpad` (`audit-results.json` + 9 PNGs — arquivos temporários locais, não fazem parte do repo). Toda medida abaixo tem o número junto.

---

## Diagnóstico

Tecnicamente as três páginas estão saudáveis: status 200 nas 9 combinações, LCP entre 488ms e 920ms, console limpo, zero overflow horizontal, e — diferente do bug encontrado na home pelo relatório anterior — `title`/`description` das três já estão corretos e em português. O problema aqui não é técnico, é de **conteúdo que não é verdade** e de **conteúdo verdadeiro mas incompleto**, exatamente nas duas páginas cujo único propósito é fazer o leitor confiar.

`/seguranca` — a página cujo propósito é convencer um dono de agência a confiar dados de cliente ao produto — descreve OAuth 2.0 com "Google, Meta, HubSpot, Slack e Asana" (`app/seguranca/page.tsx:19`). `grep -ril "hubspot\|slack\|asana" app/lib` não retorna nenhum arquivo: `lib/` tem `google-drive.ts`, `evolution.ts` (WhatsApp), `projectmanagement.ts` (ClickUp) e `stripe.ts`. `/privacidade` repete a mesma lista fantasma duas vezes (`app/privacidade/page.tsx:17` e `:25`) — e numa política de privacidade isso não é só uma frase fraca, é uma declaração factualmente errada sobre com quem os dados do cliente da agência são compartilhados, no documento que existe justamente para essa transparência.

O texto real (quando é real) está bem escrito: seções numeradas, linguagem direta, planos e prazo de trial batendo com `/precos` (Starter/Pro/Agency, 14 dias, confirmado), e o plano Pro citado em `privacidade:21` bate com "Análise com IA (Claude)" do Pro em `precos/page.tsx:26`. O problema é concentrado: itens fantasmas, uma categoria trocada, e nenhuma referência cruzada entre as três páginas é clicável.

---

## Ações

Ordenadas por severidade × frequência. Severidade 0-4.

### 1 — `conversion-copy` + `seo-geo` · Sev 4 · Integrações fantasmas na página de confiança e na política de privacidade

**Achado:** `app/seguranca/page.tsx:19` — "Conexões com Google, Meta, HubSpot, Slack e Asana usam OAuth 2.0." `app/privacidade/page.tsx:17` — "Se a agência conecta ferramentas externas (Google, Meta, HubSpot, Slack, Asana), coletamos apenas os tokens de acesso..." `app/privacidade/page.tsx:25` repete a lista. Medido: `Get-ChildItem app/lib` → `apikey.ts, auth.ts, bcrypt.ts, brevo.ts, claude.ts, crypto.ts, evolution.ts, google-drive.ts, prisma.ts, projectmanagement.ts, r2.ts, stripe.ts, webhook.ts`. Nenhum arquivo de HubSpot, Slack ou Asana. `grep -ril "hubspot\|slack\|asana" app/lib` → 0 resultados. As integrações reais são Google Drive (`google-drive.ts`), WhatsApp via Evolution (`evolution.ts`), ClickUp (`projectmanagement.ts`), e OAuth de Meta + Google para conexão de conta de anúncio/Drive (confirmado em `app/app/api/oauth/google/callback/route.ts`).

**Correção:** reescrever as três ocorrências para citar só o que existe: Google Drive, WhatsApp/Evolution, ClickUp, e OAuth de Meta + Google. Sugestão de texto:
- `seguranca:19`: "Conexões com Google e Meta usam OAuth 2.0. O Vértice nunca armazena a senha da sua conta nessas plataformas — só o token de acesso, revogável a qualquer momento."
- `privacidade:17`: "Se a agência conecta ferramentas externas (Google, Meta), coletamos apenas os tokens de acesso necessários para a integração funcionar — não os dados completos dessas contas."
- `privacidade:25`: ver ação 2 abaixo (fica junto da correção de categoria).

Isso é o mesmo erro que o relatório anterior encontrou em `/integracoes` e na home (ação 1 daquele relatório) — aqui é mais grave porque está na página de segurança e na política de privacidade, não numa página de marketing de feature.

**Status:** ✅ Corrigido nesta sessão (seguranca:19, privacidade:17, privacidade:25).

### 2 — `conversion-copy` · Sev 3 · Stripe na categoria errada em `/privacidade`

**Achado:** `app/privacidade/page.tsx:25` — "Integrações que a própria agência ativa (Google Drive, Slack, HubSpot, Asana, Stripe) trocam dados diretamente com essas plataformas, conforme autorizado pela agência via OAuth." Stripe (`app/lib/stripe.ts`) é o gateway de cobrança do próprio Vértice para cobrar a agência — não algo que a agência "ativa" via OAuth. Misturar as duas categorias na mesma frase é impreciso sobre o fluxo de dados, o assunto central de uma política de privacidade.

**Correção:** separar em duas frases/categorias distintas, por exemplo: "Integrações que a própria agência ativa (Google Drive) trocam dados diretamente com essas plataformas, conforme autorizado pela agência via OAuth. Para cobrança da sua assinatura Vértice, usamos o Stripe como processador de pagamento — ele recebe os dados de cobrança do responsável pela conta, não dados de clientes finais."

*Nota de timing: `app/lib/stripe.ts` já existe no código local; o commit da migração Mercado Pago → Stripe (`a484ed0`, 2026-09-01) foi enviado a origin em 2026-09-02 junto com a migração de banco. Como são páginas de conteúdo estático sem dependência de schema de banco, isso não bloqueava editar o texto de qualquer forma.*

**Status:** ✅ Corrigido nesta sessão.

### 3 — `accessibility` · Sev 3 · Ícones sem `aria-hidden` em `/seguranca`

**Achado:** medido via DOM — `app/seguranca/page.tsx` tem 6 `<span className="material-symbols-outlined">` (um por item de `practices[]`, linhas 12-39: `lock`, `vpn_key`, `domain`, `backup`, `admin_panel_settings`, `bug_report`), nenhum com `aria-hidden`. Leitor de tela anuncia o nome da ligadura ("lock", "vpn key"...) antes de cada título de prática. `/termos` e `/privacidade` foram checadas e confirmadas sem nenhum ícone (`iconsWithoutAriaHidden: []` nas duas).

**Correção:** `aria-hidden="true"` nos 6 spans de `app/seguranca/page.tsx`. Mesmo achado sev-3 "ação 6" do relatório anterior (que já citava segurança como afetada mas não corrigiu por estar fora do escopo daquele review).

**Status:** ✅ Corrigido nesta sessão.

### 4 — `art-direction` + `behavioral-design` · Sev 2 · Referências cruzadas entre as páginas legais não são links

**Achado:** as três páginas se citam mutuamente em texto puro, sem `<Link>`:
- `app/termos/page.tsx:13` — "você concorda com estes Termos de Uso e com a Política de Privacidade" (texto, sem link para `/privacidade`).
- `app/termos/page.tsx:45` — "dados ficam disponíveis para exportação pelo prazo descrito na Política de Privacidade" (sem link).
- `app/privacidade/page.tsx:41` — "Mais detalhes na página de Segurança" (sem link para `/seguranca`).

Um dono de agência lendo a política de privacidade e querendo checar o prazo de retenção citado nos termos, ou os detalhes de segurança citados na política, precisa abandonar a leitura, voltar ao rodapé, achar o link certo, e recomeçar a leitura na outra página.

**Correção:** trocar os três trechos por `<Link href="/privacidade">Política de Privacidade</Link>` / `<Link href="/seguranca">página de Segurança</Link>` etc.

**Status:** ✅ Corrigido nesta sessão.

### 5 — `accessibility` · Sev 2 · Hierarquia de headings pula nível em `/seguranca`

**Achado:** medido — `/seguranca` tem `H1` ("Segurança") seguido direto por seis `H3` (um por prática: "Criptografia em trânsito", "OAuth 2.0 nas integrações"...), sem nenhum `H2` entre eles. `/termos` e `/privacidade` fazem certo — `H1` → `H2` para cada seção numerada (12 e 10 respectivamente). Rodapé compartilhado (`SiteFooter.tsx`) usa `H4` para as colunas "Produto"/"Empresa"/"Legal" nas três páginas, pulando de `H2`(termos/privacidade)/`H3`(segurança) direto pra `H4` — mesmo problema em todo o site, não específico destas páginas.

**Correção:** trocar os 6 `H3` de `app/seguranca/page.tsx` por `H2`. O `H4` do rodapé é correção sitewide de baixa prioridade em `SiteFooter.tsx`, não incluída aqui.

**Status:** ✅ Corrigido nesta sessão (H3→H2 em segurança). O `H4` do rodapé segue não corrigido — fora do escopo destas 3 páginas.

### 6 — `conversion-copy` + `behavioral-design` · Sev 2 · Texto legal longo sem sumário/âncoras

**Achado:** `/termos` tem 12 seções e `/privacidade` tem 10, todas em texto corrido dentro de `max-w-3xl`, sem `id` por seção e sem lista de links no topo. Nas screenshots de 1440 (`termos-1440.png`, `privacidade-1440.png`) o conteúdo ocupa uma coluna central estreita com margens laterais enormes e vazias — espaço que poderia abrigar um sumário fixo. Um dono de agência decidindo se assina normalmente quer checar 1-2 cláusulas específicas (cancelamento, retenção de dados, responsabilidade), não ler o documento inteiro — hoje isso exige scroll linear.

**Correção:** adicionar um `id` a cada seção e um bloco de sumário com links `#id` no topo, antes da primeira seção. Um sumário `sticky` na coluna lateral vazia em desktop é uma opção mais ambiciosa, não aplicada aqui.

**Status:** ✅ Corrigido nesta sessão (lista simples de âncoras). O sumário `sticky` fica como melhoria futura, não feita.

### 7 — `design-systems` · Sev 2 · Cores hardcoded em vez dos tokens de `globals.css`

**Achado:** `app/globals.css:4,8,9` define `--color-primary: #135bec`, `--color-text-main: #0d121b`, `--color-text-muted: #4c669a` sob `@theme inline`. As três páginas usam os literais em vez dos tokens: `grep -c` → `seguranca/page.tsx` 5 ocorrências, `termos/page.tsx` 3, `privacidade/page.tsx` 3 — 11 no total. Mesmo achado sev-2 "ação 9" do relatório anterior, que cobriu as 8 páginas públicas mas não estas 3.

**Correção — mapeamento literal → token (find-replace, sem mudança visual):**
| Literal | Token | Classe Tailwind |
|---|---|---|
| `#135bec` | `--color-primary` | `text-primary` / `bg-primary` |
| `#0d121b` | `--color-text-main` | `text-text-main` |
| `#4c669a` | `--color-text-muted` | `text-text-muted` |

Confirmado puramente cosmético: os valores hex dos literais são idênticos aos dos tokens, então a troca não altera nenhum pixel renderizado — só reconecta o CSS aos tokens já fixados.

**Status:** ✅ Corrigido nesta sessão nas 3 páginas. `SiteFooter.tsx` e outras páginas do site continuam com literais — fora do escopo desta rodada.

### 8 — `art-direction` · Sev 1 · Rodapé desatualizado nas próprias páginas que citam a data de atualização

**Achado:** `app/_components/SiteFooter.tsx:61` — `© 2025 Vértice. Todos os direitos reservados.` Mas `app/termos/page.tsx:70` e `app/privacidade/page.tsx:62` mostram, na mesma tela, "Última atualização: 15 de agosto de 2026". Um usuário lendo justamente as duas páginas que afirmam ter sido atualizadas em 2026 vê no rodapé da mesma página um copyright de 2025 — inconsistência pequena mas visível, no lugar errado para parecer descuido.

**Correção:** `© {new Date().getFullYear()} Vértice.` em vez do literal `2025`, uma linha.

**Status:** ✅ Corrigido nesta sessão.

### 9 — `conversion-copy` · Sev 1 · Afirmações de segurança vagas, sem número que sustente a confiança

**Achado:** `app/seguranca/page.tsx:29` — "backups automáticos regulares" (sem frequência, sem RPO/RTO). `:34` — "Acesso... restrito à equipe responsável" (sem menção a MFA, SSO, ou processo de revisão de acesso). Nenhuma menção a certificação (SOC 2, ISO 27001 — aceitável não ter, mas então nem citar), uptime histórico, ou link para status page. Para um dono de agência decidindo confiar dados de cliente, "regulares" não ancora confiança do jeito que um número ("backup diário, retenção de 30 dias") ancoraria.

**Correção:** substituir qualificadores vagos por números reais onde existem (frequência de backup, uptime dos últimos N meses se houver dado); onde não existem, é mais honesto omitir a frase do que deixar vaga.

**Status:** ⏸️ Não corrigido nesta sessão — exige números reais de infraestrutura (frequência de backup, MFA/SSO, processo de revisão de acesso) que só o usuário tem; inventar um número seria pior do que deixar vago. Fica pendente até o usuário fornecer os dados reais.

---

## Lacunas jurídicas — não corrigidas aqui

Estes itens são sinalizados para o usuário resolver com apoio jurídico; **não é proposto texto de correção por IA aqui**, por decisão já tomada — é risco jurídico real.

- **Sem Encarregado/DPO nomeado.** `app/privacidade/page.tsx:33` cita os artigos 17-22 da LGPD (direitos do titular) mas a LGPD também exige, no art. 41, a indicação de um Encarregado (DPO) e seus dados de contato. Nenhuma das três páginas nomeia um Encarregado — hoje `contato@vertice.app` (confirmado como caixa real: `app/lib/brevo.ts:192` usa esse endereço como destinatário do formulário de contato) cobre a função na prática, mas não está formalmente designado como tal em lugar nenhum.
- **Sem CNPJ nem razão social do Vértice em nenhuma página pública nem em `docs/`.** Confirmado via `grep -i "CNPJ\|razão social" app/app` → 0 ocorrências reais (o único hit de "DPO" no grep foi falso-positivo, substring de "endpoint" em `novidades/page.tsx`). Um contrato de adesão (termos de uso) tipicamente precisa identificar a contraparte formalmente.

---

## Não achei nada relevante

- **`web-performance`:** LCP entre 488ms e 920ms nas 9 combinações (o pior caso, `/seguranca` em 360px, ainda é bom), console limpo em todas, zero requisição com erro real — a única entrada em `failedRequests` foi `GET /login?_rsc=17uqz :: ERR_ABORTED` em `/seguranca@768`, prefetch do Next, mesmo ruído já descartado no relatório anterior.
- **`responsive-design`:** zero overflow horizontal nas 9 combinações (`scrollWidth === clientWidth` em todas). Layout em coluna única legível em 360px nas três páginas.
- **`motion-design`:** as três páginas não têm nenhuma animação — nem a `animate-pulse` problemática que o relatório anterior encontrou na home. Nada a corrigir, nada a favor: páginas estáticas por natureza.
- **`accessibility` (contraste):** `#4c669a` sobre fundo branco mede 5.71:1 de contraste — passa WCAG AA (4.5:1) confortavelmente para texto normal, embora fique abaixo do AAA (7:1). Verificado porque a cor é usada como corpo de texto em ~2.500 palavras de conteúdo legal; não é achado.
- **`accessibility` (landmarks):** as três páginas têm `HEADER`, `NAV`, `MAIN`, `FOOTER` presentes e únicos — sem landmark duplicado ou ausente.
- **`conversion-copy` (consistência numérica):** trial de 14 dias sem cartão (`termos:25`) bate com `/precos`. Planos Starter/Pro/Agency (`termos:25`) batem com os três planos reais de `/precos`. "Análise com IA (Claude)" do plano Pro citada em `privacidade:21` bate com o mesmo recurso listado em `precos/page.tsx:26`. Nenhuma divergência de dado entre as páginas legais e o resto do produto.

---

## Fora de escopo agora

- **`app/signup/page.tsx:126`** mostra `vertice.app/` como prefixo do slug da agência no formulário de cadastro — produção é `vertice.roilabs.com.br`, não `vertice.app`. Achado real, encontrado ao checar consistência de domínio a partir do `contato@vertice.app` citado nas páginas legais, mas `/signup` não é uma das três páginas no escopo desta auditoria. Sinalizado para uma futura revisão do fluxo de cadastro.
- **Verificação de que a retenção de 90 dias (`privacidade:29`) é de fato implementada por alguma rotina automática de expurgo:** é uma checagem de backend/infraestrutura, fora do que uma auditoria de Playwright contra as páginas públicas consegue confirmar.

---

## Conflito declarado

Nenhum.

## Falso positivo descartado

Um grep case-insensitive por `DPO` em `app/app` retornou `novidades/page.tsx` — o "match" era a substring `dpo` dentro da palavra "**endpoint**", sem relação com Encarregado de Dados. Confirmado ao ler o trecho (linha 27, changelog de webhooks). **Não é achado** — registrado para ninguém repetir a busca e reportar por engano um DPO citado no changelog.
