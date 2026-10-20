import { NextResponse } from "next/server";
import { escapeHtml as e, layout, salesInbox, sendMail } from "@/lib/server/mail";
import { clientIp, limited } from "@/lib/server/rate-limit";

// Newsletter sign-ups are forwarded to the sales inbox (no mailing-list service was archived).
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ ok: false }, { status: 400 });
  if (limited(`news:${clientIp(req)}`)) return NextResponse.json({ ok: false }, { status: 429 });
  const name = String(b.name || "").slice(0, 120).trim();
  const email = String(b.email || "").slice(0, 200).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false }, { status: 400 });
  const ok = await sendMail({
    to: salesInbox(),
    replyTo: email,
    subject: `[Newsletter] ${email}`,
    html: layout(`<p>New newsletter subscriber:</p><p><strong>${e(name)}</strong> &lt;${e(email)}&gt; (${e(String(b.lang || ""))})</p>`),
    text: `New newsletter subscriber: ${name} <${email}> (${b.lang || ""})`,
  });
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
