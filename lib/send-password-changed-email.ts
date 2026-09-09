import { Resend } from "resend";

// Same verified-domain constraint as lib/send-reminder-email.ts — the
// from-address's domain must match send.lumanova.app exactly.
const FROM = "Lumanova <hello@send.lumanova.app>";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lumanova.app";
const LOGO_URL = `${APP_URL}/logo.png`;
const RESET_URL = `${APP_URL}/forgot-password`;

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

interface SendPasswordChangedEmailParams {
  to: string;
  firstName: string;
}

// Security notification sent right after a successful change-password —
// see app/api/account/notify-password-changed/route.ts. Best-effort by
// design from the caller's side: a failed send here should never undo or
// block the password change that already succeeded.
export async function sendPasswordChangedEmail({
  to,
  firstName,
}: SendPasswordChangedEmailParams): Promise<void> {
  const text = `Hey ${firstName},

Your Lumanova password was just changed.

If this was you, no action is needed.

If you didn't make this change, reset your password right away: ${RESET_URL}

— Lumanova`;

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto;padding:32px 24px;">
<div style="text-align:center;padding:0 0 24px;">
<img src="${LOGO_URL}" alt="Lumanova" width="140" style="max-width:140px;width:100%;height:auto;display:inline-block;" />
</div>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Hey ${escapeHtml(firstName)},</p>
<p style="margin:0 0 20px;font-size:16px;line-height:1.6;font-weight:600;">Your Lumanova password was just changed.</p>
<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4a4a4a;">If this was you, no action is needed.</p>
<p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#4a4a4a;">If you didn&rsquo;t make this change, reset your password right away:</p>
<p style="margin:0 0 28px;">
<a href="${RESET_URL}" style="display:inline-block;background:#F4C430;color:#0A0A0A;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;">Reset your password &rarr;</a>
</p>
<p style="margin:0;font-size:13px;color:#8a8a8a;">— Lumanova</p>
</div>`;

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: "Your Lumanova password was changed",
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
