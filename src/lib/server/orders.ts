import "server-only";
import { getDict } from "@/lib/i18n";
import { isLang, type Lang } from "@/lib/site";
import { TICKET_TYPES, type Order } from "@/lib/types";
import { dbConfigured, listOrders, updateOrders } from "./db";
import { escapeHtml as e, layout, salesInbox, sendMail } from "./mail";
import { APP_TAG, stripe } from "./stripe";

const money = (v: number, cur: string) => `${cur.toUpperCase() === "USD" ? "$" : "€"} ${Number(v).toFixed(2).replace(".", ",")}`;
const table = (rows: [string, string][], bold = true) =>
  `<table style="border-collapse:collapse;width:100%;margin:8px 0">${rows
    .map(([k, v]) => `<tr><td style="padding:5px 0;color:#888;width:40%">${e(k)}</td><td style="padding:5px 0;${bold ? "font-weight:600" : ""}">${e(v)}</td></tr>`)
    .join("")}</table>`;

/** Confirmation to the customer + notification to the sales inbox – one e-mail per purchase (all combo parts) */
export async function sendOrderMails(rows: Order[]) {
  if (!rows.length) return;
  const o = rows[0];
  const lang: Lang = o.lang && isLang(o.lang) ? o.lang : "en";
  const d = getDict(lang);
  const t = d.checkout;
  const ref = o.group_ref || o.ref;
  const total = rows.reduce((s, r) => s + Number(r.total), 0);
  const ticketRows: [string, string][] = TICKET_TYPES.filter((k) => o[k] > 0).map((k) => [d.booking[k], String(o[k])]);

  const head: [string, string][] = [[t.orderNo, ref], ...(o.combo_name ? ([[t.summary, o.combo_name]] as [string, string][]) : [])];
  const partBlocks = rows.map((r) =>
    table([[o.combo_name ? "•" : t.summary, r.product_name], [t.date, r.date], ...(r.time_slot ? ([[d.booking.time, r.time_slot]] as [string, string][]) : [])]),
  );
  const foot: [string, string][] = [...ticketRows, [d.booking.total, money(total, o.currency)]];
  const textParts = rows.map((r) => `${r.product_name} – ${r.date}${r.time_slot ? " " + r.time_slot : ""}`).join("\n");

  const customer = sendMail({
    to: o.email,
    subject: `${t.successTitle} ${ref}`,
    html: layout(`<p style="font-size:18px;font-weight:700;margin:0 0 8px">${e(t.successTitle)}</p><p>${e(t.successText.replace("{email}", o.email))}</p>${table(head)}${partBlocks.join("")}${table(foot)}`),
    text: `${t.successTitle}\n\n${t.successText.replace("{email}", o.email)}\n\n${head.map(([k, v]) => `${k}: ${v}`).join("\n")}\n${textParts}\n${foot.map(([k, v]) => `${k}: ${v}`).join("\n")}`,
    replyTo: salesInbox(),
  });

  const internal: [string, string][] = [
    ["Ref", ref],
    ...(o.combo_name ? ([["Combo", `${o.combo_name} (#${o.combo_id})`]] as [string, string][]) : []),
    ...rows.map((r) => [`${r.product_name} (#${r.product_id ?? "-"})`, `${r.date}${r.time_slot ? " " + r.time_slot : ""}`] as [string, string]),
    ...TICKET_TYPES.map((k) => [k[0].toUpperCase() + k.slice(1), String(o[k])] as [string, string]),
    ["Total", money(total, o.currency)],
    ["Name", o.name],
    ["E-mail", o.email],
    ["Phone", o.phone || "-"],
    ["Notes", o.notes || "-"],
    ["Language", o.lang || "-"],
  ];
  const sales = sendMail({
    to: salesInbox(),
    subject: `New order ${ref}: ${o.combo_name || o.product_name} – ${o.date}${o.time_slot ? " " + o.time_slot : ""}`,
    html: layout(`<p style="font-weight:700">New paid order</p>${table(internal, false)}`),
    text: internal.map(([k, v]) => `${k}: ${v}`).join("\n"),
    replyTo: o.email,
  });
  await Promise.all([customer, sales]);
}

/**
 * Marks the order rows of a Stripe Checkout session as paid (once) and sends the e-mails.
 * Called by the webhook and by the thank-you page, whichever comes first.
 */
export async function finalizeSession(sessionId: string): Promise<Order | null> {
  if (!dbConfigured()) return null;
  if (sessionId.startsWith("demo_")) {
    if (process.env.NODE_ENV === "production") return null;
    const group = encodeURIComponent(sessionId.slice(5));
    const updated = await updateOrders(`group_ref=eq.${group}&status=eq.pending`, { status: "paid", paid_at: new Date().toISOString() });
    if (updated.length) await sendOrderMails(updated);
    return updated[0] || (await listOrders(`group_ref=eq.${group}&limit=1`))[0] || null;
  }
  const s = stripe();
  if (!s || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  const session = await s.checkout.sessions.retrieve(sessionId);
  if (session.metadata?.app !== APP_TAG) return null;
  const sid = encodeURIComponent(sessionId);
  if (session.payment_status === "paid") {
    const updated = await updateOrders(`stripe_session_id=eq.${sid}&status=eq.pending&order=ref.asc`, {
      status: "paid",
      paid_at: new Date().toISOString(),
      stripe_payment_intent: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null,
    });
    // only the call that flipped pending → paid sends the e-mails
    if (updated.length) await sendOrderMails(updated.sort((a, b) => a.ref.localeCompare(b.ref)));
  }
  return (await listOrders(`stripe_session_id=eq.${sid}&limit=1`))[0] || null;
}
