/**
 * Claude API integration for onboarding briefing analysis.
 * Uses claude-sonnet-4-6 to analyze completed onboarding step data.
 */

import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export interface BriefingInput {
  clientName: string;
  company: string | null;
  agencyName: string;
  steps: Array<{
    stepNumber: number;
    data: Record<string, unknown> | null;
    completedAt: string | null;
  }>;
  assets: Array<{ fileName: string; fileType: string }>;
  connections: Array<{ platform: string }>;
}

/**
 * Analyzes onboarding briefing data using Claude and returns a structured markdown report.
 */
export async function analyzeBriefing(input: BriefingInput): Promise<string> {
  const client = getClient();

  const stepsText = input.steps
    .filter((s) => s.completedAt)
    .map((s) => {
      const dataStr = s.data
        ? Object.entries(s.data)
            .map(([k, v]) => `  - ${k}: ${JSON.stringify(v)}`)
            .join("\n")
        : "  (sem dados)";
      return `### Etapa ${s.stepNumber}\n${dataStr}`;
    })
    .join("\n\n");

  const assetsText =
    input.assets.length > 0
      ? input.assets.map((a) => `- ${a.fileName} (${a.fileType})`).join("\n")
      : "Nenhum arquivo enviado.";

  const connectionsText =
    input.connections.length > 0
      ? input.connections.map((c) => `- ${c.platform}`).join("\n")
      : "Nenhuma plataforma conectada.";

  const prompt = `Você é um analista de marketing digital da agência "${input.agencyName}".
Analise o briefing de onboarding do cliente abaixo e produza um relatório estruturado em markdown.

## Dados do Cliente
- Nome: ${input.clientName}
${input.company ? `- Empresa: ${input.company}` : ""}

## Etapas Preenchidas
${stepsText}

## Arquivos Enviados
${assetsText}

## Plataformas Conectadas
${connectionsText}

---

Produza um relatório com as seguintes seções:
1. **Resumo Executivo** — 2-3 parágrafos descrevendo o cliente e seus objetivos principais
2. **Pontos de Atenção** — itens que precisam de ação imediata ou esclarecimento
3. **Oportunidades** — insights de marketing digital baseados nos dados fornecidos
4. **Próximos Passos Recomendados** — lista priorizada de ações concretas para a agência
5. **Checklist de Onboarding** — o que está completo e o que ainda está pendente

Use tom profissional em português brasileiro. Seja específico e acionável.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude API");
  }

  return content.text;
}
