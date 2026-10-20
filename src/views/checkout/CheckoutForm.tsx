"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatMoney, useCurrency } from "@/components/Currency";
import { ticketLabel } from "@/components/product/Booking";
import { isOpen, MAX_QTY, parseYmd } from "@/lib/availability";
import type { BookingPart } from "@/components/product/Booking";
import type { Dict } from "@/lib/i18n";
import type { Lang } from "@/lib/site";
import { emptyCounts, TICKET_TYPES, type Ticket } from "@/lib/types";

type Item = { title: string; url: string; cover: string; minQty: number; tickets: Ticket[]; parts: BookingPart[] };

export default function CheckoutForm({
  lang,
  t,
  tb,
  termsUrl,
  privacyUrl,
  termsLabel,
  privacyLabel,
  products,
}: {
  lang: Lang;
  t: Dict["checkout"];
  tb: Dict["booking"];
  termsUrl: string;
  privacyUrl: string;
  termsLabel: string;
  privacyLabel: string;
  products: Record<string, Item>;
}) {
  const sp = useSearchParams();
  const { cur } = useCurrency();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const id = sp.get("p") || "";
  const item = products[id];
  // one date (and time) per base ticket: d<id>=YYYY-MM-DD&t<id>=HH:MM
  const picks = (item?.parts || []).map((part) => ({ part, date: parseYmd(sp.get(`d${part.id}`) || ""), slot: sp.get(`t${part.id}`) }));
  const picksOk = picks.length > 0 && picks.every(({ part, date, slot }) => !!date && isOpen(part, date) && (!part.timeSlots.length || (!!slot && part.timeSlots.includes(slot))));
  const counts = emptyCounts();
  for (const k of TICKET_TYPES) counts[k] = Math.min(MAX_QTY, Math.max(0, parseInt(sp.get(k) || "0", 10) || 0));
  const lines = item ? item.tickets.filter((tk) => counts[tk.type] > 0) : [];
  const qty = lines.reduce((s, tk) => s + counts[tk.type], 0);
  const total = lines.reduce((s, tk) => s + tk.price * counts[tk.type], 0);
  const mainType = item ? (item.tickets.find((tk) => tk.type === "adult") || item.tickets[0])?.type : undefined;
  const valid = item && (!mainType || counts[mainType] >= 1) && picksOk && qty >= item.minQty && total > 0;

  if (!valid) {
    return (
      <div className="max-w-xl">
        <p className="mb-4">{tb.soldOut}</p>
        <Link href={item?.url || (lang === "en" ? "/" : `/${lang}`)} className="btn-lime inline-block px-6 py-2">
          {item ? t.backToProduct : t.backHome}
        </Link>
      </div>
    );
  }

  const fmt = (d: Date) => `${d.getDate()} ${tb.months[d.getMonth()]} ${d.getFullYear()}`;
  const [termsBefore, rest] = t.accept.split("{terms}");
  const [between, privacyAfter] = (rest || "").split("{privacy}");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!fd.firstName || !fd.lastName || !fd.email || !fd.accept) {
      setError(t.invalid);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: +id, parts: picks.map(({ part, slot }) => ({ id: part.id, date: sp.get(`d${part.id}`), slot })), counts, currency: cur, lang, customer: fd }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.url) {
        window.location.assign(j.url);
        return;
      }
      setError(j.error || t.error);
    } catch {
      setError(t.error);
    }
    setBusy(false);
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div>
        <h2 className="mb-4 font-display text-xl font-semibold">{t.yourDetails}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            {t.firstName} *
            <input name="firstName" required autoComplete="given-name" className="field mt-1" />
          </label>
          <label className="block text-sm">
            {t.lastName} *
            <input name="lastName" required autoComplete="family-name" className="field mt-1" />
          </label>
          <label className="block text-sm">
            {t.email} *
            <input name="email" type="email" required autoComplete="email" className="field mt-1" />
          </label>
          <label className="block text-sm">
            {t.phone}
            <input name="phone" type="tel" autoComplete="tel" className="field mt-1" />
          </label>
        </div>
        <label className="mt-3 block text-sm">
          {t.notes}
          <textarea name="notes" rows={3} className="field mt-1 resize-y" />
        </label>
        <label className="mt-5 flex items-start gap-2 text-[15px]">
          <input type="checkbox" name="accept" value="1" required className="mt-1 accent-lime-dark" />
          <span>
            {termsBefore}
            <Link href={termsUrl} target="_blank" className="underline">
              {termsLabel}
            </Link>
            {between}
            <Link href={privacyUrl} target="_blank" className="underline">
              {privacyLabel}
            </Link>
            {privacyAfter}
          </span>
        </label>
        {error && <p className="mt-3 text-sm text-brand-red">{error}</p>}
      </div>

      <aside className="h-fit rounded-lg bg-[#f6f6f6] p-5">
        <h2 className="mb-4 font-display text-xl font-semibold">{t.summary}</h2>
        <div className="flex gap-3">
          <span className="relative size-20 shrink-0 overflow-hidden rounded bg-paper">
            <Image src={item.cover} alt="" fill sizes="80px" className="object-cover" />
          </span>
          <Link href={item.url} className="font-semibold leading-snug hover:text-brand-red">
            {item.title}
          </Link>
        </div>
        <dl className="mt-4 space-y-2 text-[15px]">
          {picks.map(({ part, date, slot }) =>
            picks.length > 1 ? (
              <div key={part.id} className="rounded bg-white/70 px-3 py-2">
                <div className="text-sm leading-snug font-semibold">{part.title}</div>
                <div className="text-sm text-muted">
                  {fmt(date!)}
                  {slot ? ` · ${slot}` : ""}
                </div>
              </div>
            ) : (
              <div key={part.id} className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted">{t.date}</dt>
                  <dd>{fmt(date!)}</dd>
                </div>
                {slot && (
                  <div className="flex justify-between">
                    <dt className="text-muted">{tb.time}</dt>
                    <dd>{slot}</dd>
                  </div>
                )}
              </div>
            ),
          )}
          {lines.map((tk) => (
            <div key={tk.type} className="flex justify-between gap-3">
              <dt className="text-muted">{ticketLabel(tk, tb)}</dt>
              <dd className="text-right">
                {counts[tk.type]} × {formatMoney(tk.price, cur)}
              </dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-[#ddd] pt-3 text-lg font-semibold">
            <dt>{tb.total}</dt>
            <dd>{formatMoney(total, cur)}</dd>
          </div>
        </dl>
        <button disabled={busy} className="btn-lime mt-5 w-full py-3 font-semibold disabled:opacity-60">
          {busy ? "…" : t.pay}
        </button>
        <p className="mt-3 text-center text-xs text-muted">{t.secure}</p>
      </aside>
    </form>
  );
}
