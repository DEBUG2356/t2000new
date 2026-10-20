"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { firstBookable, isOpen, MAX_QTY, ymd, type OpenRules } from "@/lib/availability";
import type { Dict } from "@/lib/i18n";
import { emptyCounts, type Ticket, type TicketCounts } from "@/lib/types";
import { formatMoney, useCurrency } from "../Currency";
import { IconCalendar, IconChevron, IconClock, IconClose, IconTick } from "../Icons";

type T = Dict["booking"];

/** What gets a date (and time): the product itself, or each base ticket of a combo */
export type BookingPart = OpenRules & { id: number; title: string; timeSlots: string[] };
export type BookingProduct = { id: number; title: string; tickets: Ticket[]; minQty: number; parts: BookingPart[] };

export const OPEN_BOOKING = "t2000:book";

export const ticketLabel = (t: Ticket, tb: T) => `${tb[t.type]}${t.age ? ` (${t.age})` : ""}`;
export const countsQuery = (c: TicketCounts) =>
  (Object.entries(c) as [keyof TicketCounts, number][])
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k}=${n}`)
    .join("&");

function Calendar({ rules, value, onPick, t, isClosed, onView }: { rules: OpenRules; value: Date | null; onPick: (d: Date) => void; t: T; isClosed: (ds: string) => boolean; onView: (month: Date) => void }) {
  const today = useMemo(() => new Date(), []);
  const start = value || firstBookable(rules, today) || today;
  const [view, setView] = useState(new Date(start.getFullYear(), start.getMonth(), 1));
  useEffect(() => onView(view), [view, onView]);
  const first = (view.getDay() + 6) % 7; // Monday first
  const daysIn = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(first).fill(null), ...Array.from({ length: daysIn }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))];
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" disabled={!canPrev} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="flex size-8 items-center justify-center rounded-full hover:bg-paper disabled:opacity-30" aria-label="Previous month">
          <IconChevron dir="left" className="size-4" />
        </button>
        <div className="font-semibold">
          {t.months[view.getMonth()]} {view.getFullYear()}
        </div>
        <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="flex size-8 items-center justify-center rounded-full hover:bg-paper" aria-label="Next month">
          <IconChevron dir="right" className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
        {t.days.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const ok = isOpen(rules, d, today) && !isClosed(ymd(d));
          const sel = value && ymd(value) === ymd(d);
          return (
            <button
              key={i}
              type="button"
              disabled={!ok}
              onClick={() => onPick(d)}
              className={`flex aspect-square items-center justify-center rounded-md text-sm transition-colors ${
                sel ? "bg-lime font-bold text-[#212529] ring-2 ring-lime-dark" : ok ? "bg-[#f4fbe0] hover:bg-lime-soft" : "text-[#bbb] line-through decoration-[#ddd]"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" disabled={value <= min} onClick={() => onChange(value - 1)} className="flex size-9 items-center justify-center rounded-full border border-brand-red text-xl leading-none text-brand-red disabled:opacity-30" aria-label="-">
        −
      </button>
      <span className="w-6 text-center text-lg font-semibold">{value}</span>
      <button type="button" disabled={value >= max} onClick={() => onChange(value + 1)} className="flex size-9 items-center justify-center rounded-full border border-brand-red text-xl leading-none text-brand-red disabled:opacity-30" aria-label="+">
        +
      </button>
    </div>
  );
}

type Closed = { days: Set<string>; slots: Record<string, string[]> };

export default function Booking({ product, checkoutUrl, contactUrl, buttonLabel, t }: { product: BookingProduct; checkoutUrl: string; contactUrl: string; buttonLabel: string; t: T }) {
  const router = useRouter();
  const { cur } = useCurrency();
  const parts = product.parts;
  const combo = parts.length > 1;
  const [open, setOpen] = useState(false);
  const [dates, setDates] = useState<Record<number, Date | null>>({});
  const [slots, setSlots] = useState<Record<number, string | null>>({});
  const [active, setActive] = useState(0);
  const tickets = product.tickets;
  const [counts, setCounts] = useState<TicketCounts>(() => {
    const c = emptyCounts();
    const main = tickets.find((tk) => tk.type === "adult") || tickets[0];
    if (main) c[main.type] = Math.max(1, product.minQty);
    return c;
  });
  const total = tickets.reduce((s, tk) => s + tk.price * counts[tk.type], 0);
  const qty = tickets.reduce((s, tk) => s + counts[tk.type], 0);
  // the adult ticket (or the first type when there is no adult) can never go below 1
  const mainType = tickets.find((tk) => tk.type === "adult")?.type ?? tickets[0]?.type;
  const bookable = tickets.some((tk) => tk.price > 0);

  // closures set in the admin calendars, loaded per base ticket and visible month
  const [closed, setClosed] = useState<Record<number, Closed>>({});
  const loadMonth = useCallback((partId: number, m: Date) => {
    const from = ymd(new Date(m.getFullYear(), m.getMonth(), 1));
    const to = ymd(new Date(m.getFullYear(), m.getMonth() + 1, 0));
    fetch(`/api/availability?p=${partId}&from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: { days: string[]; slots: Record<string, string[]> } | null) => {
        if (!j) return;
        setClosed((prev) => {
          const cur = prev[partId] || { days: new Set<string>(), slots: {} };
          return { ...prev, [partId]: { days: new Set([...cur.days, ...j.days]), slots: { ...cur.slots, ...j.slots } } };
        });
      })
      .catch(() => {});
  }, []);
  const slotClosed = (part: BookingPart, ds: string, s: string) => !!closed[part.id]?.slots[ds]?.includes(s);
  const dayClosed = (part: BookingPart, ds: string) => !!closed[part.id]?.days.has(ds) || (part.timeSlots.length > 0 && part.timeSlots.every((s) => slotClosed(part, ds, s)));
  const partDone = (part: BookingPart) => {
    const d = dates[part.id];
    if (!d || dayClosed(part, ymd(d))) return false;
    if (!part.timeSlots.length) return true;
    const s = slots[part.id];
    return !!s && !slotClosed(part, ymd(d), s);
  };
  const allDone = parts.every(partDone);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_BOOKING, show);
    // ?check-availability (links from the product cards) opens the picker right away
    if (new URLSearchParams(window.location.search).has("check-availability")) show();
    return () => window.removeEventListener(OPEN_BOOKING, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open]);

  /** after a part is complete, move on to the next unfinished one */
  const advance = (fromIndex: number, nextDates: Record<number, Date | null>, nextSlots: Record<number, string | null>) => {
    const done = (p: BookingPart) => !!nextDates[p.id] && (!p.timeSlots.length || !!nextSlots[p.id]);
    const next = parts.findIndex((p, i) => i > fromIndex && !done(p));
    setActive(next >= 0 ? next : parts.findIndex((p) => !done(p)));
  };

  const pickDate = (i: number, part: BookingPart, d: Date) => {
    const nd = { ...dates, [part.id]: d };
    const ns = { ...slots };
    if (ns[part.id] && slotClosed(part, ymd(d), ns[part.id]!)) ns[part.id] = null;
    setDates(nd);
    setSlots(ns);
    if (combo && !part.timeSlots.length) advance(i, nd, ns);
  };
  const pickSlot = (i: number, part: BookingPart, s: string) => {
    const ns = { ...slots, [part.id]: s };
    setSlots(ns);
    if (combo) advance(i, dates, ns);
  };

  const ready = allDone && (!mainType || counts[mainType] >= 1) && qty >= product.minQty && total > 0;

  const go = () => {
    if (!ready) return;
    const q = parts.map((p) => `d${p.id}=${ymd(dates[p.id]!)}${slots[p.id] ? `&t${p.id}=${encodeURIComponent(slots[p.id]!)}` : ""}`).join("&");
    router.push(`${checkoutUrl}?p=${product.id}&${q}&${countsQuery(counts)}`);
  };

  const fmtDate = (d: Date) => `${d.getDate()} ${t.months[d.getMonth()]} ${d.getFullYear()}`;

  const picker = (part: BookingPart, i: number) => {
    const d = dates[part.id] || null;
    return (
      <div className="space-y-4">
        <Calendar rules={part} value={d} onPick={(x) => pickDate(i, part, x)} t={t} isClosed={(ds) => dayClosed(part, ds)} onView={(m) => loadMonth(part.id, m)} />
        {d && part.timeSlots.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <IconClock className="size-4 text-lime-dark" /> {t.timeSlot}
            </div>
            <div className="flex flex-wrap gap-2">
              {part.timeSlots.map((s) => {
                const off = slotClosed(part, ymd(d), s);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={off}
                    onClick={() => pickSlot(i, part, s)}
                    className={`rounded-md border px-3.5 py-1.5 text-sm ${slots[part.id] === s ? "border-lime-dark bg-lime font-semibold" : "border-[#ddd] hover:border-lime"} disabled:cursor-not-allowed disabled:border-[#eee] disabled:text-[#bbb] disabled:line-through`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-lime block w-full py-2 text-[15px]">
        {buttonLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-xl bg-white sm:max-w-md sm:rounded-xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal aria-label={t.title}>
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#eee] bg-white px-5 py-4">
              <div>
                <div className="text-xs tracking-wide text-muted uppercase">{t.title}</div>
                <div className="font-display text-lg leading-snug font-semibold">{product.title}</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-1 text-muted hover:text-ink" aria-label={t.close}>
                <IconClose className="size-5" />
              </button>
            </div>

            {!bookable ? (
              <div className="px-5 py-6">
                <p className="text-[15px] leading-relaxed">{t.soldOut}</p>
                <Link href={contactUrl} className="btn-lime mt-4 inline-block px-6 py-2">
                  {t.contactUs}
                </Link>
              </div>
            ) : (
              <div className="space-y-6 px-5 py-5">
                {combo ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted">{t.comboHint}</p>
                    {parts.map((part, i) => {
                      const d = dates[part.id];
                      const done = partDone(part);
                      const isActive = active === i;
                      return (
                        <div key={part.id} className={`rounded-lg border ${isActive ? "border-lime-dark" : "border-[#e3e3e3]"}`}>
                          <button type="button" onClick={() => setActive(isActive ? -1 : i)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                            <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-lime text-[#212529]" : "bg-paper text-muted"}`}>
                              {done ? <IconTick className="size-3.5" /> : i + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block leading-snug font-semibold">{part.title}</span>
                              {d && (
                                <span className="block text-sm text-muted">
                                  {fmtDate(d)}
                                  {slots[part.id] ? ` · ${slots[part.id]}` : ""}
                                </span>
                              )}
                            </span>
                            {!isActive && d && <span className="text-xs text-brand-red">{t.change}</span>}
                          </button>
                          {isActive && <div className="border-t border-[#eee] px-4 py-4">{picker(part, i)}</div>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <div className="mb-3 flex items-center gap-2 font-semibold">
                      <IconCalendar className="size-5 text-lime-dark" /> {t.selectDate}
                    </div>
                    {picker(parts[0], 0)}
                  </div>
                )}

                {(combo ? allDone : !!dates[parts[0].id]) && (
                  <div>
                    <div className="mb-2 font-semibold">{t.chooseQty}</div>
                    <div className="divide-y divide-[#eee] rounded-md border border-[#e3e3e3]">
                      {tickets.map((tk) => (
                        <div key={tk.type} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div>
                            <div className="font-medium">{ticketLabel(tk, t)}</div>
                            <div className="text-sm text-muted">
                              {tk.oldPrice ? <span className="mr-1.5 line-through">{formatMoney(tk.oldPrice, cur)}</span> : null}
                              {formatMoney(tk.price, cur)}
                            </div>
                          </div>
                          <Stepper
                            value={counts[tk.type]}
                            // at least 1 adult (main) ticket, and the order keeps the product's minimum quantity
                            min={Math.max(tk.type === mainType ? 1 : 0, product.minQty - (qty - counts[tk.type]))}
                            max={MAX_QTY}
                            onChange={(n) => setCounts({ ...counts, [tk.type]: Math.max(0, n) })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#eee] pt-4">
                  <div>
                    <div className="text-sm text-muted">{t.total}</div>
                    <div className="text-xl font-semibold">{allDone ? formatMoney(total, cur) : "—"}</div>
                  </div>
                  <button type="button" disabled={!ready} onClick={go} className="btn-lime px-7 py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-50">
                    {t.continue}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function BuyNowButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_BOOKING))} className="btn-dark px-14 py-2.5 text-[15px]">
      {label}
    </button>
  );
}
