import "server-only";
import { site } from "@/lib/site";

// Transactional e-mail through the Resend HTTP API. Without RESEND_API_KEY the message is only logged.
export const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

export async function sendMail({ to, subject, html, text, replyTo }: { to: string | string[]; subject: string; html: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || `Tickets 2000 <no-reply@tickets2000.com>`;
  if (!key) {
    console.info(`[mail] (no RESEND_API_KEY) to=${[to].flat().join(",")} subject="${subject}"\n${text}`);
    return true;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to].flat(), subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    console.error("[mail] Resend error", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}

/** Where order notifications and contact messages go */
export const salesInbox = () => process.env.SALES_EMAIL?.trim() || site.email;

export function layout(body: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#333;max-width:560px;margin:0 auto">
<div style="background:#464c5e;padding:16px 20px;border-radius:6px 6px 0 0"><span style="color:#b5e61d;font-weight:700;font-size:20px;letter-spacing:1px">TICKETS</span> <span style="color:#fff;font-weight:700">2000</span></div>
<div style="border:1px solid #e3e3e3;border-top:0;padding:20px;border-radius:0 0 6px 6px">${body}</div>
<p style="color:#888;font-size:12px;text-align:center;margin-top:12px">${escapeHtml(site.name)} · ${escapeHtml(site.email)} · ${escapeHtml(site.phone)}</p>
</div>`;
}
