"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { loadCalendar, setClosure, setClosures } from "@/app/admin/actions";
import { ymd } from "@/lib/availability";

const MONTHS = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];
const DAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const WEEKDAY_LONG = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];

type Rules = { closedWeekdays: number[]; closedDates: string[]; months: number[] };
const key = (date: string, slot: string) => `${date}|${slot}`;

/** Why a day is closed by the product's general rules (weekday, yearly date, season) – or null */
function ruleClosed(d: Date, r: Rules) {
  if (r.closedWeekdays.includes(d.getDay())) return "heti szünnap";
  const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (r.closedDates.includes(md)) return "minden évben zárva";
  if (r.months.length && !r.months.includes(d.getMonth() + 1)) return "szezonon kívül";
  return null;
}

export default function ClosureCalendar({ productId, slots, rules }: { productId: number; slots: string[]; rules: Rules }) {
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [sold, setSold] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [multi, setMulti] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const first = (view.getDay() + 6) % 7;
  const daysIn = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysIn }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1));

  // one small query per visible month: closures + sold tickets of this product only
  const load = useCallback(async () => {
    setLoading(true);
    const from = ymd(new Date(view.getFullYear(), view.getMonth(), 1));
    const to = ymd(new Date(view.getFullYear(), view.getMonth() + 1, 0));
    try {
      const r = await loadCalendar(productId, from, to);
      setClosed(new Set(r.closures.map((c) => key(c.date, c.slot))));
      const m = new Map<string, number>();
      for (const s of r.sold) {
        m.set(key(s.date, ""), (m.get(key(s.date, "")) || 0) + s.n);
        if (s.slot) m.set(key(s.date, s.slot), (m.get(key(s.date, s.slot)) || 0) + s.n);
      }
      setSold(m);
    } catch {
      setError("A naptár betöltése nem sikerült.");
    }
    setLoading(false);
  }, [productId, view]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch the visible month
    load();
  }, [load]);

  /** optimistic toggle of one day ("") or one slot – a single row on the server */
  const toggle = async (date: string, slot: string) => {
    const k = key(date, slot);
    const willClose = !closed.has(k);
    setError("");
    setBusy((b) => new Set(b).add(k));
    setClosed((c) => {
      const n = new Set(c);
      if (willClose) n.add(k);
      else n.delete(k);
      return n;
    });
    const r = await setClosure(productId, date, slot, willClose).catch(() => ({ ok: false }));
    if (!r.ok) {
      setError("Nem sikerült menteni, próbáld újra.");
      setClosed((c) => {
        const n = new Set(c);
        if (willClose) n.delete(k);
        else n.add(k);
        return n;
      });
    }
    setBusy((b) => {
      const n = new Set(b);
      n.delete(k);
      return n;
    });
  };

  const bulk = async (close: boolean) => {
    const dates = [...picked];
    if (!dates.length) return;
    setError("");
    setClosed((c) => {
      const n = new Set(c);
      for (const d of dates) {
        if (close) n.add(key(d, ""));
        else n.delete(key(d, ""));
      }
      return n;
    });
    const r = await setClosures(productId, dates, close).catch(() => ({ ok: false }));
    if (!r.ok) {
      setError("Nem sikerült menteni, a naptár újratöltődik.");
      load();
    }
    setPicked(new Set());
  };

  const sel = selected ? new Date(selected + "T12:00:00") : null;
  const selRule = sel ? ruleClosed(sel, rules) : null;
  const dayClosed = selected ? closed.has(key(selected, "")) : false;
  const closedSlotsOf = (date: string) => slots.filter((s) => closed.has(key(date, s))).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="rounded border border-[#ddd] px-2.5 py-1 hover:border-slate" aria-label="Előző hónap">
            ‹
          </button>
          <div className="min-w-40 text-center font-bold">
            {view.getFullYear()}. {MONTHS[view.getMonth()]}
          </div>
          <button type="button" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="rounded border border-[#ddd] px-2.5 py-1 hover:border-slate" aria-label="Következő hónap">
            ›
          </button>
          {loading && <span className="text-xs text-muted">betöltés…</span>}
          <label className="ml-auto flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={multi}
              onChange={(e) => {
                setMulti(e.target.checked);
                setPicked(new Set());
              }}
              className="accent-lime-dark"
            />
            Több nap kijelölése
          </label>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted">
          {DAYS.map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: first }, (_, i) => (
            <div key={`e${i}`} />
          ))}
          {days.map((d) => {
            const ds = ymd(d);
            const past = d < today;
            const rule = ruleClosed(d, rules);
            const isClosed = closed.has(key(ds, ""));
            const partly = !isClosed && closedSlotsOf(ds) > 0;
            const n = sold.get(key(ds, "")) || 0;
            const isSel = multi ? picked.has(ds) : selected === ds;
            const tone = past
              ? "bg-[#f4f4f4] text-[#bbb]"
              : rule
                ? "bg-[repeating-linear-gradient(45deg,#f1f1f1,#f1f1f1_6px,#e4e4e4_6px,#e4e4e4_12px)] text-[#999]"
                : isClosed
                  ? "bg-[#fecaca] text-[#991b1b]"
                  : partly
                    ? "bg-[#fde68a] text-[#92400e]"
                    : "bg-[#dcfce7] text-[#166534]";
            return (
              <button
                key={ds}
                type="button"
                disabled={past}
                onClick={() => {
                  if (multi) {
                    setPicked((p) => {
                      const s = new Set(p);
                      if (s.has(ds)) s.delete(ds);
                      else s.add(ds);
                      return s;
                    });
                  } else setSelected(ds);
                }}
                onDoubleClick={() => {
                  // double click: close / reopen the whole day
                  if (!multi && !busy.has(key(ds, ""))) toggle(ds, "");
                }}
                title={multi ? undefined : "Kattintás: kijelölés · dupla kattintás: egész nap lezárása / megnyitása"}
                className={`relative flex h-16 flex-col items-start justify-between rounded-md p-1.5 text-left transition ${tone} ${isSel ? "ring-2 ring-slate ring-offset-1" : ""} ${busy.has(key(ds, "")) ? "opacity-60" : ""} disabled:cursor-default`}
              >
                <span className="text-sm font-bold">{d.getDate()}</span>
                <span className="text-[10px] leading-tight">
                  {isClosed ? "zárva" : rule && !past ? rule : partly ? `${closedSlotsOf(ds)} időpont zárva` : ""}
                  {n > 0 && <span className="block font-semibold">🎟 {n}</span>}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <i className="inline-block size-3 rounded bg-[#dcfce7]" /> nyitva
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block size-3 rounded bg-[#fecaca]" /> egész nap zárva
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block size-3 rounded bg-[#fde68a]" /> néhány időpont zárva
          </span>
          <span className="flex items-center gap-1">
            <i className="inline-block size-3 rounded bg-[#e4e4e4]" /> általános szabály szerint zárva
          </span>
          <span>🎟 = eladott jegyek</span>
        </div>
      </div>

      <div className="rounded-lg border border-[#e5e5e5] p-4">
        {multi ? (
          <div>
            <div className="font-bold">{picked.size} nap kijelölve</div>
            <p className="mt-1 text-sm text-muted">Kattints a napokra, majd zárd le vagy nyisd meg őket egyszerre.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" disabled={!picked.size} onClick={() => bulk(true)} className="rounded bg-brand-red px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">
                Lezárás
              </button>
              <button type="button" disabled={!picked.size} onClick={() => bulk(false)} className="rounded bg-[#16a34a] px-3 py-2 text-sm font-semibold text-white disabled:opacity-40">
                Megnyitás
              </button>
            </div>
          </div>
        ) : !selected || !sel ? (
          <p className="text-sm text-muted">Válassz egy napot a naptárban.</p>
        ) : (
          <div>
            <div className="font-bold">
              {selected.replaceAll("-", ".")}. {WEEKDAY_LONG[sel.getDay()]}
            </div>
            {selRule && <p className="mt-1 rounded bg-[#f3f4f6] p-2 text-xs">Az általános szabály szerint zárva ({selRule}). Ezt fent, a Foglalhatóság résznél lehet módosítani.</p>}
            {(sold.get(key(selected, "")) || 0) > 0 && <p className="mt-1 text-xs text-[#92400e]">Erre a napra már {sold.get(key(selected, ""))} jegy kelt el.</p>}
            <button
              type="button"
              disabled={busy.has(key(selected, ""))}
              onClick={() => toggle(selected, "")}
              className={`mt-3 w-full rounded px-3 py-2.5 text-sm font-semibold text-white ${dayClosed ? "bg-[#16a34a] hover:bg-[#15803d]" : "bg-brand-red hover:bg-[#b91515]"} disabled:opacity-50`}
            >
              {dayClosed ? "Egész nap megnyitása" : "Egész nap lezárása"}
            </button>

            {slots.length > 0 && (
              <div className={`mt-4 ${dayClosed ? "pointer-events-none opacity-40" : ""}`}>
                <div className="mb-2 text-sm font-semibold">Időpontok</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {slots.map((s) => {
                    const k = key(selected, s);
                    const c = closed.has(k);
                    const n = sold.get(k) || 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={busy.has(k)}
                        onClick={() => toggle(selected, s)}
                        title={c ? "Zárva – kattints a megnyitáshoz" : "Nyitva – kattints a lezáráshoz"}
                        className={`rounded border px-1 py-1.5 text-sm ${c ? "border-[#fca5a5] bg-[#fee2e2] text-[#991b1b] line-through" : "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] hover:border-[#16a34a]"} disabled:opacity-50`}
                      >
                        {s}
                        {n > 0 && <span className="block text-[10px] no-underline">🎟 {n}</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted">Kattintásra az adott időpont zárul vagy nyílik – azonnal mentődik.</p>
              </div>
            )}
          </div>
        )}
        {error && <p className="mt-3 text-sm text-brand-red">{error}</p>}
      </div>
    </div>
  );
}
