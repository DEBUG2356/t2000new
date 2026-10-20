import { NextResponse } from "next/server";
import { isOpen, MAX_QTY, parseYmd } from "@/lib/availability";
import { pageUrl, productHeading, productTitle, productUrl } from "@/lib/catalog";
import { getDict } from "@/lib/i18n";
import { getCatalog } from "@/lib/server/catalog";
import { dbConfigured, fetchClosures, insertOrders, updateOrders } from "@/lib/server/db";
import { clientIp, limited } from "@/lib/server/rate-limit";
import { APP_TAG, orderRef, stripe } from "@/lib/server/stripe";
import { site, isLang, type Lang } from "@/lib/site";
import { emptyCounts, fromPrice, TICKET_TYPES, type Order } from "@/lib/types";

const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  if (limited(`checkout:${clientIp(req)}`, 20)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  if (!dbConfigured()) return NextResponse.json({ error: "Orders are not configured." }, { status: 503 });

  const lang: Lang = isLang(body.lang) ? body.lang : "en";
  const catalog = await getCatalog();
  const p = catalog.get(Number(body.productId));
  if (!p || !p.tickets.some((t) => t.price > 0)) return NextResponse.json({ error: "This offer is not available." }, { status: 400 });

  // one date (and time slot) per base ticket – a normal product is its own single part
  const parts = catalog.parts(p);
  const sent: { id: number; date: string; slot: string | null }[] = Array.isArray(body.parts) ? body.parts : [];
  const picks = parts.map((part) => {
    const s = sent.find((x) => Number(x.id) === part.id);
    return { part, date: String(s?.date || ""), slot: s?.slot ? String(s.slot) : null };
  });
  for (const { part, date, slot } of picks) {
    const d = parseYmd(date);
    if (!d || !isOpen(part, d)) return NextResponse.json({ error: "This date is not available." }, { status: 400 });
    if (part.timeSlots.length ? !slot || !part.timeSlots.includes(slot) : !!slot) return NextResponse.json({ error: "Please select a time." }, { status: 400 });
    // closures from the admin calendar of the base ticket (whole day or the chosen slot)
    const closures = await fetchClosures(part.id, date, date);
    if (closures.some((c) => c.slot === "" || c.slot === slot)) return NextResponse.json({ error: "This date or time is no longer available." }, { status: 409 });
  }

  const c = body.customer || {};
  const email = clip(c.email, 200);
  const firstName = clip(c.firstName, 80);
  const lastName = clip(c.lastName, 80);

  // ticket counts, priced on the server from the product's ticket types
  const counts = emptyCounts();
  for (const k of TICKET_TYPES) counts[k] = p.tickets.some((t) => t.type === k) ? Math.max(0, Math.min(MAX_QTY, Math.floor(Number(body.counts?.[k]) || 0))) : 0;
  const lines = p.tickets.filter((t) => counts[t.type] > 0);
  const qty = lines.reduce((s, t) => s + counts[t.type], 0);
  const totalEur = lines.reduce((s, t) => s + t.price * counts[t.type], 0);
  const mainType = p.tickets.find((t) => t.type === "adult")?.type ?? p.tickets[0]?.type;
  if (qty < p.minQty || totalEur <= 0 || (mainType && counts[mainType] < 1)) return NextResponse.json({ error: "Invalid quantity." }, { status: 400 });
  if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !c.accept) return NextResponse.json({ error: "Missing customer data." }, { status: 400 });

  const usd = body.currency === "USD";
  const conv = (eur: number) => Math.round((usd ? eur * site.usdRate : eur) * 100);
  const totalCents = lines.reduce((s, t) => s + conv(t.price) * counts[t.type], 0);
  const group = orderRef();
  const title = productTitle(p, lang);
  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const tb = getDict(lang).booking;
  const combo = parts.length > 1;

  // a combo's price is shared between its base tickets in proportion to their own prices
  const weights = picks.map(({ part }) => fromPrice(part)?.price || 1);
  const wsum = weights.reduce((a, b) => a + b, 0);
  let left = totalCents;
  const shares = weights.map((w, i) => {
    const v = i === weights.length - 1 ? left : Math.round((totalCents * w) / wsum);
    left -= v;
    return v / 100;
  });

  // one order row per base ticket, linked by group_ref
  const rows: Partial<Order>[] = picks.map(({ part, date, slot }, i) => ({
    ref: combo ? `${group}-${i + 1}` : group,
    group_ref: group,
    status: "pending",
    email,
    name: `${firstName} ${lastName}`,
    phone: clip(c.phone, 40) || null,
    ...counts,
    date,
    time_slot: slot,
    product_id: part.id,
    product_name: productTitle(part, "en"),
    total: shares[i],
    currency: usd ? "USD" : "EUR",
    lang,
    notes: clip(c.notes, 1000) || null,
    combo_id: combo ? p.id : null,
    combo_name: combo ? productTitle(p, "en") : null,
  }));
  await insertOrders(rows);

  const s = stripe();
  if (!s) {
    if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Payments are not configured." }, { status: 503 });
    // local demo without Stripe keys: the thank-you page marks the order as paid
    return NextResponse.json({ url: `${origin}${pageUrl("success", lang)}?session_id=demo_${group}` });
  }

  const when = picks.map(({ part, date, slot }) => `${combo ? productHeading(part, lang) + ": " : ""}${date}${slot ? ` ${slot}` : ""}`).join(" · ");
  try {
    const metadata = { app: APP_TAG, ref: group, product_id: String(p.id), dates: when.slice(0, 480) };
    const session = await s.checkout.sessions.create({
      mode: "payment",
      locale: lang,
      customer_email: email,
      line_items: lines.map((t) => ({
        quantity: counts[t.type],
        price_data: {
          currency: usd ? "usd" : "eur",
          unit_amount: conv(t.price),
          product_data: { name: `${title} – ${tb[t.type]}${t.age ? ` (${t.age})` : ""}`, description: when.slice(0, 500) },
        },
      })),
      metadata,
      payment_intent_data: { metadata, description: `${group} – ${title}`.slice(0, 500) },
      success_url: `${origin}${pageUrl("success", lang)}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${pageUrl("cancel", lang)}?back=${encodeURIComponent(productUrl(p, lang))}`,
    });
    await updateOrders(`group_ref=eq.${group}`, { stripe_session_id: session.id });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[checkout] stripe error", e);
    await updateOrders(`group_ref=eq.${group}`, { status: "cancelled" }).catch(() => {});
    return NextResponse.json({ error: "The payment could not be started." }, { status: 502 });
  }
}
