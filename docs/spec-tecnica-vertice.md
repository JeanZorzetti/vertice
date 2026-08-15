# ESPECIFICAÇÃO TÉCNICA E PROMPT DE EXECUÇÃO: VÉRTICE SAAS
**Autor:** Engenheiro de Front-end & Arquiteto de Produto de Elite (Gemini Notebook)  
**Data:** 15 de Agosto de 2026  
**Status do Projeto:** Bloqueado em Produção (Necessita de Recuperação Operacional Emergencial)  
**Stack de Referência:** Next.js 16.1.6 (App Router), React 19.2.3, Prisma 7.4.2 (pg adapter), Tailwind CSS v4, Anthropic SDK 0.78.0, Playwright 1.58.2, Vercel (gru1)

---

# Visão e Estratégia de Produto (HEART)

A Vértice é um SaaS B2B white-label de onboarding projetado para automatizar a coleta de dados de novos clientes por agências de marketing [1]. Sob a ótica do **Google HEART Framework**, a sua estratégia de engenharia de produto está direcionada para os seguintes vetores de desempenho [32]:

1. **Task Success (Sucesso na Tarefa):**
   - **Objetivo:** Garantir que o cliente da agência finalize o fluxo guiado de 4 etapas (dados, assets, conexões e briefing) sem interrupções ou erros lógicos [1, 6].
   - **Métricas:** Taxa de Conclusão do Onboarding (Onboarding Status migrando de `PENDING` para `COMPLETED`), Taxas de Erro (Error Rates) em integrações de API/OAuth e a latência percebida para submissão [5, 33]. Monitoramento micro-tático via *Single Ease Question* (SEQ) de 7 pontos (meta de $\ge 5.5$) ao fim de cada etapa concluída [38].
   
2. **Retention (Retenção):**
   - **Objetivo:** Evitar o cancelamento das agências garantindo a operação impecável do seu portal de clientes.
   - **Métricas:** Churn de agências pagantes e Retenção de Receita Líquida (NRR) [33].
   - **Diagnóstico de Crise:** Atualmente, a retenção está em risco extremo (SaaS fora do ar em produção devido à ausência de `DATABASE_URL` no ambiente da Vercel) [2]. Sob as métricas de usabilidade da escala SUS (System Usability Scale), um sistema inoperante ou instável amarga uma pontuação $SUS < 51.6$ (F/Pobre), prevendo um abandono em massa nos trials das agências [2, 37].

3. **Adoption (Adoção):**
   - **Objetivo:** Minimizar o *Time-to-Value* (tempo para o primeiro valor) para as agências recém-cadastradas [31].
   - **Métricas:** Tempo médio de configuração do domínio white-label e envio do primeiro link de onboarding ativo [6, 33].

4. **Happiness (Felicidade):**
   - **Objetivo:** Satisfação subjetiva e facilidade percebida pelo cliente final ao realizar o onboarding, impactando diretamente a percepção do serviço prestado pela agência.
   - **Métricas:** Pontuação SUS normalizada acima de $84.1$ (A+/Excelente) aplicada aos fluxos de onboarding do cliente [33, 37].

5. **Engagement (Engajamento):**
   - **Objetivo:** Frequência de interação ativa no dashboard da agência [33].
   - **Métricas:** Relação DAU/MAU de administradores de agência analisando briefings gerados [7, 33].

---

# Diretrizes de UX e Arquitetura

Para blindar a experiência de uso da Vértice e otimizar a carga cognitiva, a interface de onboarding de 4 etapas (`/onboarding/[token]/*`) deve ser rigidamente governada pelas seguintes leis de UX, heurísticas e padrões de Generative UI [6]:

### 1. Leis de UX e Redução de Carga Cognitiva

- **Lei de Hick-Hyman (Minimização do Tempo de Decisão):**
  O onboarding de novos clientes é intencionalmente fatiado em 4 etapas lineares (`empresa` $\rightarrow$ `brand-assets` $\rightarrow$ `platforms` $\rightarrow$ `briefing`) [6]. Essa separação em subtarefas focadas reduz drasticamente a latência mental em comparação a um formulário massivo de página única [45].
- **Lei de Fitts (Cinomática de Interface):**
  Os botões primários de ação (ex: "Conectar Plataforma" ou "Avançar Etapa") devem possuir hitboxes táteis generosas ($\ge 44px$ em mobile) [43]. Em desktops, as áreas de interação cruciais devem capitalizar os cantos físicos da viewport ou de seus contêineres para otimizar o Tempo de Movimento (MT) e o Índice de Dificuldade (ID) [43].
- **Limiar de Doherty (Feedback Instantâneo < 400ms):**
  Qualquer ação de alta latência — como o upload de assets de marca pesados para o Cloudflare R2 ou conexões OAuth de rede — deve responder em menos de 400ms [8, 19, 46]. Caso o tempo de processamento real exceda esse limite, a interface exibirá *skeletons* de carregamento progressivos animados e atualizações otimistas (Optimistic UI) no front-end para evitar a inércia mental do usuário [22, 47].
- **Efeito Zeigarnik (Estímulo de Conclusão):**
  Exibição persistente de um rastreador de etapas visual com percentual dinâmico de preenchimento (ex: "Etapa 2 de 4: 50% concluído") para estimular psicologicamente o usuário a fechar o ciclo de tarefas pendentes [48].
- **Número Mágico de Miller (Agrupamento Cognitivo):**
  O preenchimento de dados de empresa e briefings estratégicos deve organizar as perguntas em pedaços lógicos de tamanho $7 \pm 2$, eliminando a sobrecarga de memória de trabalho [48].

### 2. Heurísticas de Usabilidade Aplicadas

- **Visibilidade do Status do Sistema (Heurística 1):**
  Mutações de dados, uploads e sincronizações devem ser sinalizadas em tempo real via notificações *toast* que reflitam o estado preciso da transação (carregando, sucesso, falha com proposta de recuperação de erro) [22].
- **Controle e Liberdade do Usuário (Heurística 3):**
  Mecanismos de reversão imediata (*Undo* ou *Soft Delete*) na listagem de arquivos anexados e integrações salvas, evitando alertas modais intrusivos e repetitivos [24].
- **Prevenção de Erros (Heurística 5):**
  Validações sintáticas estritas no lado do cliente (via Zod + React Hook Form) desativando os botões de ação e aplicando máscaras em tempo real em campos numéricos/telefones antes que o contrato de dados atinja o servidor [26].
- **Ajuda Contextual Dinâmica (Heurística 10):**
  Inserção de tooltips inteligentes e *empty states* instrutivos em rotas de configuração da agência (ex: explicando o impacto da chave API na sincronização com ferramentas de PM como ClickUp, Notion ou Trello) [8, 31].

### 3. Padrões de Generative UI (GenUI)

- **Generativa Controlada (Estática):**
  A análise de briefing do cliente concluído (executada por meio da chamada `analyzeBriefing()` no Anthropic SDK consumindo o modelo `claude-sonnet-4-6` ou modelos Claude 5 superiores) deve alimentar um componente de layout estrito pré-construído no Next.js [3, 8, 36]. O LLM não injetará código de front-end dinâmico não-fiscalizado (evitando quebras de design de marca e vulnerabilidades de segurança); em vez disso, retornará metadados tipados e seções em Markdown que serão hidratadas em componentes semânticos polidos sob as diretrizes de WCAG 2.2 [36, 57].
- **Dissociação Tática (Split-Screen / Chat+):**
  No painel administrativo da agência, a interface de revisão estratégica do briefing de cliente utilizará um layout de tela dividida [7, 62]. De um lado, o chat textual interativo atua como console de instrução e perguntas ao assistente sobre o cliente; do outro, uma tela limpa e independente (Canvas) exibe o documento estratégico de marca renderizado [62]. As alterações instigadas pelo chat realizam atualizações síncronas diretamente no Canvas (via AG-UI Protocol operando sobre barramento persistente em tempo real), permitindo manipulação direta sem a poluição visual de uma conversa linear contínua [61, 62].

---

# Arquitetura de Interface e Componentes Core

A interface do Vértice deve ser modular, desacoplada e reutilizável, respeitando a herança de estilo e regras white-label estritas.

### 1. Gestão de Cores Dinâmicas com OKLCH

As cores da interface devem abandonar representações estáticas HSL ou RGB que falham na consistência de contraste luminoso [53]. O Vértice adota o espaço de cores **OKLCH** para o cálculo dinâmico de paletas baseadas na cor principal definida pela agência (`primaryColor` persistida no modelo `Agency`) [5]:

- **Luminância Real (L) Padronizada:** O cálculo de tons derivados (ex: hover, focos, bordas ativas e contrastes ideais) será parametrizado de forma matemática e perceptual [54, 55]:
  ```css
  /* Definição de token de cor ativa calculada de forma uniforme */
  --agency-primary: oklch(from var(--agency-primary-base) l c h);
  --agency-primary-hover: oklch(from var(--agency-primary-base) calc(l - 0.15) c h);
  --agency-primary-light: oklch(from var(--agency-primary-base) 0.95 0.05 h);
  ```
- **Conformidade de Acessibilidade:** Garantia de contrastes ideais de legibilidade dinâmicos (sob padrões WCAG 2.2 de 4.5:1 e formulações avançadas APCA), adaptando as cores de fontes e ícones contextualmente ao fundo sem a necessidade de intervenção empírica manual [55, 57].

### 2. Ontologia de Design Tokens (W3C Standard)

Todos os elementos de interface seguem a estrutura de tokens hierárquicos para fins de extensibilidade e portabilidade entre plataformas (compilados via Style Dictionary) [50]:

- **Tokens Globais (Primitivos):** Constantes rígidas de escala física.
  - Escala de espaçamento baseada em grade de 8px: `space-8` (8px), `space-16` (16px), `space-24` (24px) [56].
  - Transições físicas: `duration-200` (200ms para ativações de estado), `duration-350` (350ms para transições de painéis/Doherty Threshold) [58].
  - Curvas de easing cubic-bezier calibradas em molas físicas [58].
- **Tokens Semânticos (Alias/Intenção):**
  - Mapeamento de intenção: `color.brand.primary` (herdando o OKLCH calculado do cliente), `color.state.error` (associado a falhas estruturais) [52].
- **Tokens de Componentes:**
  - Estilos restritos e isolados a nível de elemento: `button.primary.background` bindado a `color.brand.primary` para prevenir vazamentos de estilo na árvore DOM [52].

### 3. Componentes Globais React (Core Next.js Architecture)

- **`OnboardingLayout` (White-Label Wrapper):**
  - Consome o token de cliente, injeta no estado do React as customizações estéticas (`logoUrl`, `primaryColor` resolvida em OKLCH) da agência e gerencia o isolamento multitenant no client-side [5].
- **`StepTracker` (Zeigarnik Navigation):**
  - Componente visual com barra de progresso determinística e status de conclusão (consome o enum `OnboardingStatus`) [5]. Se comunica via transições suaves animadas no limite de 350ms [58].
- **`FileUploader` (Progressive R2 Storage):**
  - Componente com suporte a drag-and-drop. Dispara requisições assíncronas para as rotas `/assets` para recuperar presigned URLs do Cloudflare R2 [7, 8]. Exibe indicador visual incremental de progresso (Streaming do status de upload) e toasts preventivos para restrição de arquivos [22, 26].
- **`OAuthConnector` (Platform Sync Hub):**
  - Componente visual para gerenciar conexões OAuth de canais de marketing (Meta, Google Ads, Google Analytics) [5]. Apresenta feedback visual detalhado e em tempo real sobre o status da transação (integrando fluxos e callbacks `/api/oauth/*`) [7].

---

# Plano de Ação: Tarefas de Execução (Tasks)

O objetivo central deste plano de ação é reverter a inoperabilidade do SaaS em produção, estabilizar a segurança do ecossistema e estruturar a implantação dos recursos críticos de UI baseados em dados reais do repositório [2, 10, 15, 18].

### Épico I: Estabilização de Produção e Segurança Crítica (Bloqueadores #1)

- [ ] **Task 1: Provisionamento Emergencial de DATABASE_URL em Produção**
  - **Requisitos Funcionais:** Configurar a variável de ambiente `DATABASE_URL` no painel de administração do projeto Vercel (`jean-zorzettis-projects/vertice`) na região `gru1` [2, 3, 12].
  - **Requisitos de UX/UI:** Garantir que após a configuração, a chamada não autenticada para `/api/health` responda com sucesso (HTTP 200) e exiba o status funcional do banco de dados sem quebras ou latência [3, 10].
  - **Critérios de Aceite:** Executar `curl -I https://vertice.roilabs.com.br/api/health` e receber HTTP 200, retornando `{"db":"ok", "status":"healthy"}` em produção [2, 18]. Todo o fluxo de cadastro (`/signup`) e login (`/admin/login`) deve voltar a renderizar e autenticar novos usuários [2, 6, 7].

- [ ] **Task 2: Auditoria e Versionamento de Variáveis de Ambiente (.env.example)**
  - **Requisitos Funcionais:** Criar o arquivo `.env.example` na raiz do projeto contendo as assinaturas exatas das 30 variáveis de ambiente mapeadas no código [13]. Validar o setup de produção para as chaves cruciais das APIs parceiras: `RESEND_API_KEY`, tokens do Cloudflare R2, segredos das APIs de OAuth da Meta e do Google, chaves do Mercado Pago e credenciais de desenvolvedor da Anthropic SDK [8, 13, 15].
  - **Requisitos de UX/UI:** N/A (Configuração de Infraestrutura).
  - **Critérios de Aceite:** Presença do arquivo `.env.example` versionado no repositório [13]. Sucesso no envio do formulário de contato em `/contato` acionando com êxito a integração real do Resend [7, 8, 15].

- [ ] **Task 3: Mitigação de Vulnerabilidade de Credenciais Default e Seed Pública**
  - **Requisitos Funcionais:** Modificar o arquivo `prisma/seed.ts` e o arquivo de teste automatizado `e2e/smoke.spec.ts` para que não persistam credenciais em texto aberto ou utilizem credenciais públicas (`admin@roi-labs.com` / `vertice2025`) [10, 11]. Implementar variáveis locais ou secrets dinâmicos para a execução do seed no banco de dados [10, 11].
  - **Requisitos de UX/UI:** Exibição de alertas de validação visual caso o usuário administrativo tente manter senhas julgadas fracas no painel `/admin/settings` [7, 26].
  - **Critérios de Aceite:** Remoção completa da senha default `vertice2025` de todos os arquivos de configuração pública ou código versionado no repositório [10].

- [ ] **Task 4: Correção de Vazamento de Detalhes de Infraestrutura em `/api/health`**
  - **Requisitos Funcionais:** Alterar a lógica do manipulador de rota da API `/api/health` para mascarar por completo ou suprimir logs crus do Prisma ORM e impedir a visibilidade de dados de conexão ao Postgres (como host, porta ou nome da base de dados) [10].
  - **Requisitos de UX/UI:** A rota deve retornar apenas uma resposta limpa e impessoal de integridade em JSON [10, 23].
  - **Critérios de Aceite:** O payload de `/api/health` em produção não deve expor strings que revelem parâmetros da `DATABASE_URL` [10].

### Épico II: Correção de Arquitetura e Higiene de UI

- [ ] **Task 5: Eliminação de Páginas Órfãs e Implementação de RLS Multitenant**
  - **Requisitos Funcionais:** Deletar os arquivos de rotas estáticas órfãs e dados mocados `app/onboarding/brand-assets/page.tsx` e `app/onboarding/platforms/page.tsx` [15, 16]. Implementar verificações sistemáticas de isolamento multitenant nas consultas ao banco utilizando o `agencyId` em todas as rotas dinâmicas baseadas em token [5, 6].
  - **Requisitos de UX/UI:** O cliente final que trafegar pela rota do portal deve ser estritamente contido no escopo dinâmico `/onboarding/[token]/*` correspondente ao seu token de sessão, impedindo o carregamento acidental de mockups ou dados genéricos globais [6, 16].
  - **Critérios de Aceite:** Exclusão física das rotas órfãs [16]. Tentativas de acesso direto a rotas sem token de onboarding válido devem redirecionar imediatamente para a página de erro 404 customizada da aplicação [3, 6].

- [ ] **Task 6: Setup do Espaço Cromático OKLCH no Tailwind CSS v4**
  - **Requisitos Funcionais:** Configurar o arquivo global de estilo para ler a cor cadastrada da agência (`primaryColor` do modelo `Agency`) e instanciar propriedades personalizadas de CSS dinâmicas baseadas na sintaxe do espaço de cores OKLCH (`oklch(L C H)`) [3, 5, 54].
  - **Requisitos de UX/UI:** Permitir que o portal do cliente `/onboarding/[token]/*` renderize com precisão a identidade da agência contratante (Logotipo, Cores e Tipografia), garantindo contrastes de acessibilidade automáticos calculados dinamicamente para estados interativos de foco/hover [5, 6, 55, 57].
  - **Critérios de Aceite:** O arquivo de estilos processa as cores primárias em OKLCH e as renderiza no navegador sem quebra de paletas ou inconsistências cromáticas biológicas de luminância (testado contra visualizadores modernos e navegadores compatíveis com CSS Color Module Level 4) [53, 54].

### Épico III: Engenharia do Fluxo de Onboarding e Integração de IA

- [ ] **Task 7: Implementação do StepTracker Progressivo (Efeito Zeigarnik)**
  - **Requisitos Funcionais:** Desenvolver o componente modular `StepTracker` consumindo o estado atual do processo (`OnboardingStatus` do modelo do banco de dados) e sinalizando o andamento percentual de progresso do preenchimento [5, 48].
  - **Requisitos de UX/UI:** O tracker deve apresentar transições sutis com curvas de aceleração parametrizadas em tokens temporais de micro-interação de no máximo 350ms (Doherty Threshold) [46, 58]. Exibir um indicador sutil "X% Completo" para criar a tensão neurológica do Efeito Zeigarnik e impulsionar a taxa de conclusão [48].
  - **Critérios de Aceite:** O componente renderiza em todas as 4 etapas de onboarding dinâmico, atualizando seu estado conforme a rota do passo atual muda [6].

- [ ] **Task 8: Sincronização Progressiva e Skeletons na Etapa de Upload de Assets**
  - **Requisitos Funcionais:** Integrar a etapa `brand-assets` (`/onboarding/[token]/brand-assets`) com o Cloudflare R2 através da biblioteca de uploads baseada em presigned URLs (`lib/r2.ts`) [6, 8].
  - **Requisitos de UX/UI:** Durante a latência de geração de link pré-assinado e o progresso do upload real do arquivo pelo cliente, a interface de usuário deve renderizar contêineres de preenchimento progressivo (*loading skeletons*) e barras de carregamento animadas, prevenindo o estado de congelamento visual [22, 47].
  - **Critérios de Aceite:** O upload de um arquivo de logotipo pelo cliente na rota de onboarding atualiza o status visual em tempo real e persiste a URL correta no campo `logoUrl` do modelo sem travar a viewport [5].

- [ ] **Task 9: Pipeline de IA (Claude) para Briefing Estratégico com Saída Controlada**
  - **Requisitos Funcionais:** Integrar a conclusão da quarta etapa de onboarding (`briefing`) com a chamada `analyzeBriefing()` utilizando o Anthropic SDK [6, 8]. Reavaliar o modelo utilizado no arquivo `lib/claude.ts` (migrando do `claude-sonnet-4-6` legado para a família de modelos Claude 5, como o `claude-sonnet-5`, visando melhorias de raciocínio crítico) [3, 4].
  - **Requisitos de UX/UI:** A resposta da IA deve seguir o paradigma de **Generativa Controlada**: o modelo processa as respostas da agência e emite um JSON tipado estruturado com metadados e blocos em Markdown, que são injetados em componentes semânticos polidos pré-desenvolvidos no front-end em um layout unificado de tela dividida no painel administrativo (`/admin/onboardings/[id]`) [7, 36, 62]. Skeletons e atualizações dinâmicas devem cobrir o tempo de inferência do modelo [22, 47].
  - **Critérios de Aceite:** O envio bem-sucedido do briefing pelo cliente final dispara o fluxo assíncrono que gera o documento estratégico em Markdown, notifica a agência via WhatsApp (Evolution API), cria a pasta no Drive (Google Drive Service Account), lança a tarefa no ClickUp/Notion/Trello correspondente e altera o status do onboarding para `COMPLETED` [1, 5, 8]. A visualização no painel da agência exibe o layout de tela dividida funcional [7, 62].

---

# Master Prompt para Desenvolvimento por IA

O prompt abaixo foi projetado para ser copiado e colado em um assistente de IA de desenvolvimento de código ou ambiente de engenharia de software para execução cirúrgica:

```text
Você é um Engenheiro de Software Full-Stack de elite especialista em React 19, Next.js 16 (App Router), Tailwind CSS v4 e Prisma ORM. Sua tarefa é recuperar e estabilizar a aplicação SaaS "Vértice", um portal de onboarding white-label para agências de marketing que está atualmente quebrado em produção por falhas de infraestrutura.

[DIRETRIZES DE DESIGN E UX]
1. Baseie as interfaces estritamente nas 10 Heurísticas de Usabilidade de Jakob Nielsen e nas Leis de UX (Hick-Hyman para fatiamento de formulários, Fitts para hitboxes, Doherty Threshold de 400ms para respostas visuais e Efeito Zeigarnik para estimulação de conclusão com trackers dinâmicos).
2. Utilize o espaço de cores OKLCH para o cálculo dinâmico de contrastes de acessibilidade (WCAG 2.2 / APCA) e cores de hover/interações para o white-label da agência. Não utilize HSL ou RGB fixos.
3. Utilize o paradigma de Generative UI Controlada para exibir as análises de briefing produzidas pela IA (Anthropic SDK com claude-sonnet-5), emoldurando o retorno de metadados tipados e Markdown em componentes semânticos pré-construídos do React. O painel administrativo deve utilizar o layout dissociado de tela dividida (Split-Screen Canvas).
4. O termo "vibecoding" está estritamente banido de todas as comunicações, comentários de código e logs de sistema. Nunca utilize essa palavra.

[DIRETRIZES DE ENGENHARIA E INFRAESTRUTURA]
1. Pratique design modular de componentes isolados, fortemente tipados com TypeScript.
2. Atente-se à mudança de arquitetura do Next.js 16: parâmetros de rotas dinâmicas (params) são PROMISES e devem ser resolvidos com 'await params' nas páginas, middlewares ou handlers de API, evitando erros assíncronos em produção.
3. Corrija o vazamento de detalhes de infraestrutura em '/api/health': ela deve responder apenas com integridade limpa em JSON sem vazar parâmetros de string de conexão ou erros crus do ORM.
4. Garanta isolamento multitenant rígido baseado no campo 'agencyId' filtrado em todas as rotas de API e queries do Prisma.
5. Remova as credenciais de seed default públicas do arquivo 'prisma/seed.ts' e do teste 'e2e/smoke.spec.ts', utilizando secrets dinâmicos. Delete as páginas órfãs estáticas mockadas ('app/onboarding/brand-assets/page.tsx' e 'app/onboarding/platforms/page.tsx').

Implemente o Plano de Ação por etapas e garanta que o build da aplicação ('npm run build') passe sem reescrever o arquivo 'tsconfig.json' de forma destrutiva. Vá direto ao ponto, priorizando a estrutura de arquivos limpa, lógica impecável e tratamento preventivo de erros transacionais.
```
