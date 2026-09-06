import { Resend } from "resend";

// send.lumanova.app is the verified sending domain in Resend (DKIM/SPF/DMARC
// all confirmed) — the from-address's domain must match it exactly, or
// Resend rejects the send. The display name is still "Lumanova" regardless
// of which address/domain sends it.
const FROM = "Lumanova <hello@send.lumanova.app>";

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

interface SendReminderEmailParams {
  to: string;
  firstName: string;
  subject: string;
  headline: string;
  remainingLabels: string[];
  planUrl: string;
}

// Deliberately plain — a short text-first layout (one heading, a checklist,
// one link) reads as a real message rather than marketing, which is both
// more in keeping with a daily nudge and better for inbox deliverability
// than a heavy HTML template.
export async function sendReminderEmail({
  to,
  firstName,
  subject,
  headline,
  remainingLabels,
  planUrl,
}: SendReminderEmailParams): Promise<void> {
  const checklist = remainingLabels.map((label) => `- ${label}`).join("\n");

  const text = `Hey ${firstName},

${headline}

Still to do today:
${checklist}

Open your plan: ${planUrl}

— Lumanova`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto;padding:32px 24px;">
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hey ${escapeHtml(firstName)},</p>
<p style="margin:0 0 20px;font-size:16px;line-height:1.6;font-weight:600;">${escapeHtml(headline)}</p>
<p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#8a8a8a;">Still to do today</p>
<ul style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.7;">
${remainingLabels.map((label) => `<li>${escapeHtml(label)}</li>`).join("\n")}
</ul>
<p style="margin:0 0 28px;">
<a href="${planUrl}" style="display:inline-block;background:#F4C430;color:#0A0A0A;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;">Open your plan &rarr;</a>
</p>
<p style="margin:0;font-size:13px;color:#8a8a8a;">— Lumanova</p>
</div>`;

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
