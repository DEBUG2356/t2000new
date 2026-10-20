import { NextResponse } from "next/server";
import { escapeHtml as e, layout, salesInbox, sendMail } from "@/lib/server/mail";
import { clientIp, limited } from "@/lib/server/rate-limit";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ ok: false }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  if (limited(`contact:${clientIp(req)}`)) return NextResponse.json({ ok: false }, { status: 429 });
  const name = String(b.name || "").slice(0, 120).trim();
  const email = String(b.email || "").slice(0, 200).trim();
  const subject = String(b.subject || "").slice(0, 200).trim();
  const message = String(b.message || "").slice(0, 5000).trim();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return NextResponse.json({ ok: false }, { status: 400 });
  const ok = await sendMail({
    to: salesInbox(),
    replyTo: email,
    subject: `[Contact] ${subject || name}`,
    html: layout(`<p><strong>${e(name)}</strong> &lt;${e(email)}&gt; (${e(String(b.lang || ""))})</p><p><strong>${e(subject)}</strong></p><p style="white-space:pre-wrap">${e(message)}</p>`),
    text: `${name} <${email}>\n${subject}\n\n${message}`,
  });
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
