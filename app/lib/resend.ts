import { Resend } from "resend";

// Lazy init — avoids build-time crash when RESEND_API_KEY is not available
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM_EMAIL = process.env.RESEND_FROM ?? "onboarding@vertice.app";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendOnboardingCompletedEmail({
  to,
  clientName,
  clientEmail,
  companyName,
  agencyName,
  onboardingId,
}: {
  to: string[];
  clientName: string;
  clientEmail: string;
  companyName: string | null;
  agencyName: string;
  onboardingId: string;
}): Promise<void> {
  if (to.length === 0) return;

  const adminUrl = `${APP_URL}/admin/onboardings/${onboardingId}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `✅ Onboarding concluído – ${clientName}${companyName ? ` (${companyName})` : ""}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#f6f6f8;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;padding:40px 0;">
          <tr><td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7ebf3;overflow:hidden;">
              <tr>
                <td style="background:#0d121b;padding:32px 40px;text-align:center;">
                  <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Vértice</span>
                  <span style="color:#4c669a;font-size:14px;margin-left:8px;">· ${agencyName}</span>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <div style="display:inline-block;background:#dcfce7;color:#166534;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;margin-bottom:20px;">
                    ✅ Onboarding Concluído
                  </div>
                  <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0d121b;line-height:1.2;">
                    ${clientName} finalizou o onboarding
                  </h1>
                  <p style="margin:0 0 8px;font-size:15px;color:#4c669a;">
                    <strong style="color:#0d121b;">${clientName}</strong>${companyName ? ` da <strong style="color:#0d121b;">${companyName}</strong>` : ""} completou todas as etapas do portal de onboarding.
                  </p>
                  <p style="margin:0 0 32px;font-size:14px;color:#a0a9bb;">
                    E-mail: ${clientEmail}
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                    <tr>
                      <td style="background:#135bec;border-radius:10px;padding:0;">
                        <a href="${adminUrl}" style="display:inline-block;padding:16px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">
                          Ver dados do cliente →
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0;font-size:12px;color:#a0a9bb;text-align:center;">
                    Acesse o painel para visualizar todas as informações e assets enviados.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #e7ebf3;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#a0a9bb;">© 2025 Vértice · Powered by ROI Labs</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
}

export async function sendMagicLink({
  to,
  token,
  clientName,
  agencyName,
}: {
  to: string;
  token: string;
  clientName: string;
  agencyName: string;
}): Promise<void> {
  const magicUrl = `${APP_URL}/api/auth/verify?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Seu link de acesso ao onboarding – ${agencyName}`,
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
      <body style="margin:0;padding:0;background:#f6f6f8;font-family:'Segoe UI',sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f8;padding:40px 0;">
          <tr><td align="center">
            <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e7ebf3;overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background:#135bec;padding:32px 40px;text-align:center;">
                  <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Vértice</span>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px;">
                  <p style="margin:0 0 8px;font-size:14px;color:#4c669a;">Olá, ${clientName} 👋</p>
                  <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#0d121b;line-height:1.2;">
                    Seu link de acesso chegou
                  </h1>
                  <p style="margin:0 0 32px;font-size:15px;color:#4c669a;line-height:1.6;">
                    A equipe da <strong style="color:#0d121b;">${agencyName}</strong> está aguardando as informações de onboarding da sua empresa. Clique no botão abaixo para acessar o portal — o link expira em <strong>1 hora</strong>.
                  </p>
                  <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                    <tr>
                      <td style="background:#135bec;border-radius:10px;padding:0;">
                        <a href="${magicUrl}" style="display:inline-block;padding:16px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">
                          Acessar Portal de Onboarding →
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:0;font-size:12px;color:#a0a9bb;text-align:center;">
                    Se você não esperava este e-mail, pode ignorá-lo com segurança.<br/>
                    Link alternativo: <a href="${magicUrl}" style="color:#135bec;">${magicUrl}</a>
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px;border-top:1px solid #e7ebf3;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#a0a9bb;">© 2025 Vértice · Powered by ROI Labs</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });
}
