import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAgencySession } from "@/lib/auth";

const STEP1_LABELS: Record<string, string> = {
  segment: "Segmento",
  employees: "Funcionários",
  website: "Website",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  products: "Produtos / Serviços",
  audience: "Público-alvo",
  differentiator: "Diferencial competitivo",
};

const STEP4_LABELS: Record<string, string> = {
  objective: "Objetivo principal",
  budget: "Orçamento mensal",
  timeframe: "Prazo esperado",
  competitors: "Principais concorrentes",
  hasMarketingHistory: "Já fez marketing digital",
  historyDetails: "Histórico de marketing",
  notes: "Observações adicionais",
};

const OBJECTIVE_LABELS: Record<string, string> = {
  leads: "Geração de Leads",
  sales: "Aumento de Vendas",
  awareness: "Awareness de Marca",
  retention: "Retenção / Fidelização",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluído",
};

const PLATFORM_LABEL: Record<string, string> = {
  META: "Meta (Facebook/Instagram)",
  GOOGLE_ADS: "Google Ads",
  GOOGLE_ANALYTICS: "Google Analytics",
  WORDPRESS: "WordPress",
};

function fv(key: string, value: unknown): string {
  if (!value || value === "") return "—";
  if (key === "objective") return OBJECTIVE_LABELS[String(value)] ?? String(value);
  if (key === "hasMarketingHistory") return value === "yes" ? "Sim" : "Não";
  return String(value);
}

function renderMarkdownSimple(text: string): string {
  return text
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) {
        return `<h3 style="font-size:12px;font-weight:800;color:#0f172a;margin:12px 0 4px;">${line.slice(4)}</h3>`;
      }
      if (line.startsWith("## ")) {
        return `<h2 style="font-size:14px;font-weight:900;color:#0f172a;margin:16px 0 6px;">${line.slice(3)}</h2>`;
      }
      if (line.startsWith("# ")) {
        return `<h1 style="font-size:16px;font-weight:900;color:#0f172a;margin:16px 0 8px;">${line.slice(2)}</h1>`;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return `<li style="font-size:11px;color:#475569;margin:2px 0 2px 16px;">${line.slice(2).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</li>`;
      }
      if (/^\d+\. /.test(line)) {
        return `<li style="font-size:11px;color:#475569;margin:2px 0 2px 16px;">${line.replace(/^\d+\. /, "").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</li>`;
      }
      if (line.trim() === "") return `<div style="height:6px;"></div>`;
      return `<p style="font-size:11px;color:#475569;line-height:1.6;margin:2px 0;">${line.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</p>`;
    })
    .join("\n");
}

// GET /api/agency/onboardings/[id]/report
// Returns a printable HTML report for the onboarding.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAgencySession();
    const { id } = await params;

    const [onboarding, agency] = await Promise.all([
      prisma.onboarding.findUnique({
        where: { id },
        include: {
          client: { include: { agency: { select: { id: true } } } },
          steps: { orderBy: { stepNumber: "asc" } },
          assets: true,
          connections: true,
        },
      }),
      prisma.agency.findUnique({
        where: { id: session.agencyId },
        select: { name: true, primaryColor: true },
      }),
    ]);

    if (!onboarding) {
      return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
    }

    if (onboarding.client.agency.id !== session.agencyId) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
    }

    const color = agency?.primaryColor ?? "#135bec";
    const step1 = onboarding.steps.find((s) => s.stepNumber === 1);
    const step2 = onboarding.steps.find((s) => s.stepNumber === 2);
    const step4 = onboarding.steps.find((s) => s.stepNumber === 4);
    const step1Data = (step1?.data ?? {}) as Record<string, unknown>;
    const step4Data = (step4?.data ?? {}) as Record<string, unknown>;
    const step2Data = (step2?.data ?? {}) as Record<string, unknown>;
    const completedSteps = onboarding.steps.length;
    const progress = Math.round((completedSteps / 4) * 100);
    const generatedAt = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
    const initials = onboarding.client.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const statusKey = onboarding.status as keyof typeof STATUS_LABEL;
    const badgeColor = onboarding.status === "COMPLETED" ? "#059669" : onboarding.status === "IN_PROGRESS" ? "#2563eb" : "#d97706";
    const badgeBg = onboarding.status === "COMPLETED" ? "#ecfdf5" : onboarding.status === "IN_PROGRESS" ? "#eff6ff" : "#fffbeb";
    const badgeBorder = onboarding.status === "COMPLETED" ? "#a7f3d0" : onboarding.status === "IN_PROGRESS" ? "#bfdbfe" : "#fde68a";

    const step1Rows = Object.entries(STEP1_LABELS)
      .map(([k, l]) => {
        const v = fv(k, step1Data[k]);
        if (v === "—") return "";
        return `<tr><td style="font-weight:700;color:#64748b;text-transform:uppercase;font-size:9px;letter-spacing:0.06em;width:40%;padding:6px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;">${l}</td><td style="padding:6px 14px;font-size:11px;color:#475569;border-bottom:1px solid #f1f5f9;vertical-align:top;">${v}</td></tr>`;
      })
      .join("");

    const step4Rows = Object.entries(STEP4_LABELS)
      .map(([k, l]) => {
        const v = fv(k, step4Data[k]);
        if (v === "—") return "";
        return `<tr><td style="font-weight:700;color:#64748b;text-transform:uppercase;font-size:9px;letter-spacing:0.06em;width:40%;padding:6px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;">${l}</td><td style="padding:6px 14px;font-size:11px;color:#475569;border-bottom:1px solid #f1f5f9;vertical-align:top;">${v}</td></tr>`;
      })
      .join("");

    const aiSection = onboarding.aiAnalysis
      ? `<div style="margin-bottom:20px;">
          <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:8px;">Análise com IA</div>
          <div style="border:1px solid ${color}40;border-radius:8px;overflow:hidden;">
            <div style="background:${color}10;padding:10px 14px;font-size:11px;font-weight:700;color:${color};border-bottom:1px solid ${color}30;">✦ Análise Inteligente do Briefing</div>
            <div style="padding:14px;">${renderMarkdownSimple(onboarding.aiAnalysis)}</div>
          </div>
        </div>`
      : "";

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Relatório — ${onboarding.client.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #0f172a; }
    @page { margin: 20mm 18mm; size: A4; }
    @media print { .no-print { display: none !important; } }
    .print-btn { position: fixed; bottom: 24px; right: 24px; background: ${color}; color: white; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.15); }
  </style>
</head>
<body style="padding:32px;max-width:820px;margin:0 auto;">

  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:2px solid ${color};margin-bottom:24px;">
    <div>
      <div style="font-size:20px;font-weight:900;color:${color};">${agency?.name ?? "Agência"}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">Relatório de Onboarding</div>
    </div>
    <div style="font-size:10px;color:#94a3b8;text-align:right;">Gerado em ${generatedAt}</div>
  </div>

  <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;display:flex;align-items:center;gap:16px;">
    <div style="width:48px;height:48px;border-radius:50%;background:${color}20;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:${color};flex-shrink:0;">${initials}</div>
    <div style="flex:1;">
      <div style="font-size:16px;font-weight:900;color:#0f172a;">${onboarding.client.name}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">${onboarding.client.email}${onboarding.client.company ? " · " + onboarding.client.company : ""}</div>
      <div style="margin-top:8px;display:flex;align-items:center;gap:12px;">
        <span style="background:${badgeBg};color:${badgeColor};border:1px solid ${badgeBorder};border-radius:999px;padding:3px 10px;font-size:10px;font-weight:700;">${STATUS_LABEL[statusKey]}</span>
        <span style="font-size:10px;color:#64748b;">${completedSteps} de 4 etapas concluídas</span>
      </div>
    </div>
    <div style="text-align:right;min-width:80px;">
      <div style="font-size:24px;font-weight:900;color:${color};">${progress}%</div>
      <div style="height:6px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-top:4px;">
        <div style="height:100%;background:${color};border-radius:3px;width:${progress}%;"></div>
      </div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
    <div>
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:8px;">Dados da Empresa</div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        ${step1 && step1Rows ? `<table style="width:100%;border-collapse:collapse;">${step1Rows}</table>` : `<div style="padding:12px;color:#94a3b8;font-style:italic;font-size:11px;">Não preenchido.</div>`}
      </div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:8px;">Briefing Estratégico</div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        ${step4 && step4Rows ? `<table style="width:100%;border-collapse:collapse;">${step4Rows}</table>` : `<div style="padding:12px;color:#94a3b8;font-style:italic;font-size:11px;">Não preenchido.</div>`}
      </div>
    </div>
  </div>

  ${step2Data.colors || step2Data.brandPersonality ? `
  <div style="margin-bottom:20px;">
    <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:8px;">Identidade Visual</div>
    <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        ${step2Data.colors ? `<tr><td style="font-weight:700;color:#64748b;text-transform:uppercase;font-size:9px;letter-spacing:0.06em;width:40%;padding:6px 14px;border-bottom:1px solid #f1f5f9;">Cores</td><td style="padding:6px 14px;font-size:11px;color:#475569;border-bottom:1px solid #f1f5f9;">${fv("colors", step2Data.colors)}</td></tr>` : ""}
        ${step2Data.brandPersonality ? `<tr><td style="font-weight:700;color:#64748b;text-transform:uppercase;font-size:9px;letter-spacing:0.06em;width:40%;padding:6px 14px;border-bottom:1px solid #f1f5f9;">Personalidade</td><td style="padding:6px 14px;font-size:11px;color:#475569;border-bottom:1px solid #f1f5f9;">${fv("brandPersonality", step2Data.brandPersonality)}</td></tr>` : ""}
      </table>
    </div>
  </div>` : ""}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;">
    <div>
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:8px;">Arquivos Enviados (${onboarding.assets.length})</div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        ${onboarding.assets.length > 0
          ? `<table style="width:100%;border-collapse:collapse;">${onboarding.assets.map((a) => `<tr><td style="font-weight:700;color:#64748b;font-size:10px;padding:5px 14px;border-bottom:1px solid #f1f5f9;">${a.fileName}</td><td style="padding:5px 14px;font-size:10px;color:#94a3b8;border-bottom:1px solid #f1f5f9;">${a.fileType}</td></tr>`).join("")}</table>`
          : `<div style="padding:12px;color:#94a3b8;font-style:italic;font-size:11px;">Nenhum arquivo enviado.</div>`}
      </div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:8px;">Plataformas Conectadas</div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;">
        ${onboarding.connections.length > 0
          ? onboarding.connections.map((c) => `<span style="display:inline-block;background:#f1f5f9;border-radius:999px;padding:3px 10px;font-size:10px;font-weight:600;color:#475569;margin:2px;">${PLATFORM_LABEL[c.platform] ?? c.platform}</span>`).join("")
          : `<span style="color:#94a3b8;font-style:italic;font-size:11px;">Nenhuma plataforma conectada.</span>`}
      </div>
    </div>
  </div>

  ${aiSection}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;display:flex;justify-content:space-between;">
    <span>${agency?.name ?? "Agência"} · Relatório de Onboarding</span>
    <span>${onboarding.client.name} · ${generatedAt}</span>
  </div>

  <button class="no-print print-btn" onclick="window.print()">Imprimir / Salvar PDF</button>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    console.error("[report GET]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
