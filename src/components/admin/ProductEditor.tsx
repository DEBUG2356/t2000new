"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { removeProduct, retranslate, saveProduct, uploadProductImage } from "@/app/admin/actions";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/site";
import { generateSlots } from "@/lib/slots";
import ClosureCalendar from "./ClosureCalendar";
import { TICKET_TYPES, type LangText, type Product, type PropKey, type TicketType } from "@/lib/types";

const TICKET_LABEL: Record<TicketType, string> = { adult: "Adult (felnőtt)", senior: "Senior", youth: "Youth (ifjúsági)", child: "Child (gyerek)", infant: "Infant (csecsemő)" };
const PROPS: { key: PropKey; label: string }[] = [
  { key: "instant", label: "Instant Confirm" },
  { key: "mobile", label: "Mobile Ticket" },
  { key: "flexible", label: "Flexible Hours" },
  { key: "fullDay", label: "Full Day Ticket" },
  { key: "freeCancel", label: "Free Cancellation" },
  { key: "duration", label: "Duration (óra)" },
];
const WEEKDAYS = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];
const MONTHS = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];

function Card({ title, children, hint }: { title: string; children: ReactNode; hint?: string }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">{title}</h2>
      {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children, hint, className = "" }: { label: string; children: ReactNode; hint?: string; className?: string }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-semibold text-[#444]">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

/** Comma separated list input that keeps what is being typed and commits on blur */
function ListInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      value={draft ?? value.join(", ")}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        if (draft !== null) onChange(draft.split(/[,;\s]+/).filter(Boolean));
        setDraft(null);
      }}
      className="field mt-1"
    />
  );
}

const lines = (a?: string[]) => (a || []).join("\n");
const unlines = (s: string) => s.split("\n");

export default function ProductEditor({
  initial,
  categories,
  products,
}: {
  initial: Product;
  categories: { id: string; title: string }[];
  products: { id: number; title: string; isCombo: boolean }[];
}) {
  const router = useRouter();
  const [p, setP] = useState<Product>(initial);
  const [lang, setLang] = useState<Lang>("en");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSave] = useTransition();
  const [uploading, setUploading] = useState(false);
  const isNew = initial.id === 0;
  const isCombo = p.components.length > 0;
  const [comboOpen, setComboOpen] = useState(initial.components.length > 0);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));
  const text: LangText = p.i18n[lang] || { title: "", slug: "" };
  const setText = <K extends keyof LangText>(k: K, v: LangText[K]) => setP((x) => ({ ...x, i18n: { ...x.i18n, [lang]: { ...(x.i18n[lang] || { title: "", slug: "" }), [k]: v } } }));

  const save = () =>
    startSave(async () => {
      setMsg(null);
      const r = await saveProduct(p);
      if (!r.ok) {
        setMsg({ ok: false, text: r.error });
        return;
      }
      setP((x) => ({ ...x, i18n: r.i18n }));
      const names = r.translated.map((l) => LANG_LABEL[l].code).join(", ");
      const base = names ? `Mentve. Lefordítva: ${names}.` : "Mentve.";
      setMsg({ ok: !r.warning?.includes("nem sikerült"), text: r.warning ? `${base} ${r.warning}` : base });
      if (isNew) router.replace(`/admin/products/${r.id}`);
      else router.refresh();
    });

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      const r = await uploadProductImage(fd);
      if (r.url) added.push(r.url);
      else setMsg({ ok: false, text: `${f.name}: ${r.error}` });
    }
    setP((x) => ({ ...x, gallery: [...x.gallery, ...added], image: x.image || added[0] || null }));
    setUploading(false);
  };

  const moveImg = (i: number, d: number) =>
    setP((x) => {
      const g = [...x.gallery];
      const j = i + d;
      if (j < 0 || j >= g.length) return x;
      [g[i], g[j]] = [g[j], g[i]];
      return { ...x, gallery: g };
    });

  const ticket = (type: TicketType) => p.tickets.find((t) => t.type === type);
  const setTicket = (type: TicketType, patch: Partial<{ price: number; oldPrice: number | null; age: string }> | null) =>
    setP((x) => {
      const others = x.tickets.filter((t) => t.type !== type);
      if (patch === null) return { ...x, tickets: others };
      const cur = x.tickets.find((t) => t.type === type) || { type, price: 0, oldPrice: null };
      return { ...x, tickets: [...others, { ...cur, ...patch }].sort((a, b) => TICKET_TYPES.indexOf(a.type) - TICKET_TYPES.indexOf(b.type)) };
    });

  const hasProp = (k: PropKey) => p.props.find((x) => x.key === k);
  const toggleProp = (k: PropKey, on: boolean) => set("props", on ? [...p.props, k === "duration" ? { key: k, n: 1 } : { key: k }] : p.props.filter((x) => x.key !== k));

  const enTitle = p.i18n.en?.title || "Új termék";
  const [translating, setTranslating] = useState(false);
  const doRetranslate = async (langs: Lang[]) => {
    const which = langs.length === 1 ? LANG_LABEL[langs[0]].code : "az összes nyelv";
    if (!confirm(`Felülírja ${which} szövegeit az angol szöveg fordításával. Mehet?`)) return;
    setTranslating(true);
    setMsg(null);
    const r = await retranslate(p, langs);
    if (r.i18n) setP((x) => ({ ...x, i18n: r.i18n! }));
    setMsg(r.error ? { ok: false, text: r.error } : { ok: true, text: "Lefordítva – ellenőrizd, majd nyomd meg a Mentést." });
    setTranslating(false);
  };
  const slots = generateSlots(p.slotFrom, p.slotTo, p.slotStep ?? 30);
  const slotsChanged = slots.join() !== initial.timeSlots.join();

  return (
    <div className="pb-24">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => router.push("/admin/products")} className="text-sm text-muted hover:text-ink">
          ← Termékek
        </button>
        <h1 className="text-2xl font-bold">
          {enTitle} {!isNew && <span className="text-base font-normal text-muted">#{p.id}</span>}
        </h1>
      </div>

      {!isNew && !isCombo && (
        <div className="mb-5">
          <Card
            title="Naptár – lezárások"
            hint="Dupla kattintás egy napra: egész nap lezárása / megnyitása. Egy kattintással kijelölöd a napot, és jobb oldalt egyes időpontokat is lezárhatsz. Minden azonnal mentődik."
          >
            {slotsChanged && <p className="mb-3 rounded bg-[#fef9c3] p-2 text-xs text-[#854d0e]">Az időpontok megváltoztak – a weboldalon a Mentés után lépnek életbe.</p>}
            <ClosureCalendar productId={p.id} slots={slots} rules={{ closedWeekdays: p.closedWeekdays, closedDates: p.closedDates, months: p.months }} />
          </Card>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_1.25fr]">
        <div className="space-y-5">
          <Card title="Alapadatok">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm font-semibold sm:col-span-2">
                <input type="checkbox" checked={p.active} onChange={(e) => set("active", e.target.checked)} className="size-4 accent-lime-dark" />
                Aktív (megjelenik a weboldalon)
              </label>
              <Field label="Kategóriák" className="sm:col-span-2">
                <div className="mt-1 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <label key={c.id} className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1 ${p.categories.includes(c.id) ? "border-lime-dark bg-lime-soft/60" : "border-[#ddd]"}`}>
                      <input
                        type="checkbox"
                        checked={p.categories.includes(c.id)}
                        onChange={(e) => set("categories", e.target.checked ? [...p.categories, c.id] : p.categories.filter((x) => x !== c.id))}
                        className="accent-lime-dark"
                      />
                      {c.title}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Fő kategória" hint="Ez kerül a termék URL-jébe.">
                <select value={p.primaryCategory || ""} onChange={(e) => set("primaryCategory", e.target.value || null)} className="field mt-1">
                  <option value="">(első kiválasztott)</option>
                  {categories
                    .filter((c) => p.categories.includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Sorrend" hint="Kisebb szám = előrébb a listákban.">
                <input type="number" value={p.sort} onChange={(e) => set("sort", Number(e.target.value))} className="field mt-1" />
              </Field>
              <Field label="Értékelés (0–5)">
                <input type="number" step="0.1" min={0} max={5} value={p.rating ?? ""} onChange={(e) => set("rating", e.target.value === "" ? null : Number(e.target.value))} className="field mt-1" />
              </Field>
              <Field label="Vélemények száma">
                <input type="number" min={0} value={p.reviewCount ?? ""} onChange={(e) => set("reviewCount", e.target.value === "" ? null : Number(e.target.value))} className="field mt-1" />
              </Field>
              <Field label="Szélesség (lat)">
                <input type="number" step="any" value={p.lat ?? ""} onChange={(e) => set("lat", e.target.value === "" ? null : Number(e.target.value))} className="field mt-1" />
              </Field>
              <Field label="Hosszúság (lng)">
                <input type="number" step="any" value={p.lng ?? ""} onChange={(e) => set("lng", e.target.value === "" ? null : Number(e.target.value))} className="field mt-1" />
              </Field>
              <Field label="Kártyán megjelenő tulajdonságok" className="sm:col-span-2">
                <div className="mt-1 flex flex-wrap gap-3">
                  {PROPS.map((pr) => {
                    const on = hasProp(pr.key);
                    return (
                      <span key={pr.key} className="flex items-center gap-1.5">
                        <input type="checkbox" checked={!!on} onChange={(e) => toggleProp(pr.key, e.target.checked)} className="accent-lime-dark" />
                        {pr.label}
                        {pr.key === "duration" && on && (
                          <input
                            type="number"
                            min={1}
                            value={on.n ?? 1}
                            onChange={(e) => set("props", p.props.map((x) => (x.key === "duration" ? { ...x, n: Number(e.target.value) } : x)))}
                            className="field w-16 py-0.5"
                          />
                        )}
                      </span>
                    );
                  })}
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Kombó jegy" hint="Kombónál a nyitvatartást, az időpontokat és a lezárásokat az alap jegyekből veszi; a vevő jegyenként választ dátumot és időpontot, a rendelésben pedig alap jegyenként külön sor lesz.">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={comboOpen}
                onChange={(e) => {
                  setComboOpen(e.target.checked);
                  if (!e.target.checked) set("components", []);
                }}
                className="size-4 accent-lime-dark"
              />
              Ez egy kombó jegy (több alap jegyből áll)
            </label>
            {comboOpen && (
              <div className="mt-3">
                {p.components.length > 0 && (
                  <ol className="mb-3 space-y-1">
                    {p.components.map((id, i) => (
                      <li key={id} className="flex items-center gap-2 rounded bg-[#f5f3ff] px-3 py-1.5 text-sm">
                        <span className="font-bold text-[#7c3aed]">{i + 1}.</span>
                        <span className="flex-1">{products.find((x) => x.id === id)?.title || `#${id}`}</span>
                        <button type="button" disabled={i === 0} onClick={() => { const c = [...p.components]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; set("components", c); }} className="px-1 disabled:opacity-30" aria-label="fel">
                          ↑
                        </button>
                        <button type="button" onClick={() => set("components", p.components.filter((x) => x !== id))} className="px-1 text-brand-red" aria-label="eltávolítás">
                          ✕
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
                <select
                  value=""
                  onChange={(e) => e.target.value && set("components", [...p.components, Number(e.target.value)])}
                  className="field"
                >
                  <option value="">+ Alap jegy hozzáadása…</option>
                  {products
                    .filter((x) => x.id !== p.id && !x.isCombo && !p.components.includes(x.id))
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        #{x.id} {x.title}
                      </option>
                    ))}
                </select>
                {p.components.length === 1 && <p className="mt-2 text-xs text-brand-red">Kombóhoz legalább 2 alap jegy kell.</p>}
              </div>
            )}
          </Card>

          <Card title="Jegytípusok és árak" hint="Pipáld be, milyen jegyek vásárolhatók, és add meg az egyedi árukat. Ha egy sincs, a termék nem foglalható online.">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-2">Jegytípus</th>
                  <th className="pb-2">Ár (€)</th>
                  <th className="pb-2">Áthúzott ár (€)</th>
                  <th className="pb-2">Korosztály</th>
                </tr>
              </thead>
              <tbody>
                {TICKET_TYPES.map((type) => {
                  const t = ticket(type);
                  return (
                    <tr key={type} className={t ? "" : "opacity-60"}>
                      <td className="py-1.5 pr-3">
                        <label className="flex items-center gap-2 font-semibold">
                          <input type="checkbox" checked={!!t} onChange={(e) => setTicket(type, e.target.checked ? {} : null)} className="size-4 accent-lime-dark" />
                          {TICKET_LABEL[type]}
                        </label>
                      </td>
                      <td className="py-1.5 pr-2">
                        <input type="number" step="0.01" min={0} disabled={!t} value={t?.price ?? ""} onChange={(e) => setTicket(type, { price: Number(e.target.value) })} className="field w-28" />
                      </td>
                      <td className="py-1.5 pr-2">
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          disabled={!t}
                          value={t?.oldPrice ?? ""}
                          placeholder="—"
                          onChange={(e) => setTicket(type, { oldPrice: e.target.value === "" ? null : Number(e.target.value) })}
                          className="field w-28"
                        />
                      </td>
                      <td className="py-1.5">
                        <input disabled={!t} value={t?.age ?? ""} placeholder="pl. 6–17" onChange={(e) => setTicket(type, { age: e.target.value })} className="field w-28" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted">0 € = ingyenes jegy (pl. csecsemő), de a rendelésben külön számolva megjelenik.</p>
          </Card>

          {isCombo ? (
            <Card title="Foglalhatóság" hint="Kombó: a napokat, időpontokat és lezárásokat az alap jegyek beállításai adják – ott kell módosítani őket.">
              <Field label="Minimum jegyszám / rendelés">
                <input type="number" min={1} value={p.minQty} onChange={(e) => set("minQty", Number(e.target.value))} className="field mt-1 w-40" />
              </Field>
            </Card>
          ) : (
          <Card title="Foglalhatóság">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Minimum jegyszám / rendelés">
                  <input type="number" min={1} value={p.minQty} onChange={(e) => set("minQty", Number(e.target.value))} className="field mt-1" />
                </Field>
                <div className="sm:col-span-2">
                  <div className="text-sm font-semibold text-[#444]">Időpontok</div>
                  <div className="mt-1 flex flex-wrap items-end gap-3">
                    <label className="text-xs text-muted">
                      Első időpont
                      <input type="time" step={300} value={p.slotFrom || ""} onChange={(e) => set("slotFrom", e.target.value || null)} className="field mt-0.5 w-32" />
                    </label>
                    <label className="text-xs text-muted">
                      Utolsó időpont
                      <input type="time" step={300} value={p.slotTo || ""} onChange={(e) => set("slotTo", e.target.value || null)} className="field mt-0.5 w-32" />
                    </label>
                    <label className="text-xs text-muted">
                      Időköz
                      <select value={p.slotStep ?? 30} onChange={(e) => set("slotStep", Number(e.target.value))} className="field mt-0.5 w-32">
                        {[15, 20, 30, 45, 60, 90, 120].map((m) => (
                          <option key={m} value={m}>
                            {m} perc
                          </option>
                        ))}
                      </select>
                    </label>
                    {(p.slotFrom || p.slotTo) && (
                      <button type="button" onClick={() => setP((x) => ({ ...x, slotFrom: null, slotTo: null, slotStep: null }))} className="pb-2 text-xs text-brand-red hover:underline">
                        Nincs időpontválasztás
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {slots.length ? (
                      slots.map((s) => (
                        <span key={s} className="rounded bg-[#f0fdf4] px-1.5 py-0.5 text-xs text-[#166534]">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted">Nincs időpont – a vevő csak napot választ. Pl. 09:30 → 16:00, 30 perc = 14 időpont.</span>
                    )}
                  </div>
                </div>
                <Field label="Zárva ezeken a napokon" className="sm:col-span-2">
                  <div className="mt-1 flex flex-wrap gap-2">
                    {WEEKDAYS.map((d, i) => (
                      <label key={d} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={p.closedWeekdays.includes(i)}
                          onChange={(e) => set("closedWeekdays", e.target.checked ? [...p.closedWeekdays, i] : p.closedWeekdays.filter((x) => x !== i))}
                          className="accent-brand-red"
                        />
                        {d}
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Zárva dátumok (minden évben)" hint="HH-NN formátumban, vesszővel: 01-01, 05-01, 12-25" className="sm:col-span-2">
                  <ListInput value={p.closedDates} onChange={(v) => set("closedDates", v)} placeholder="01-01, 05-01, 12-25" />
                </Field>
                <Field label="Foglalható hónapok" hint="Ha egy sincs bepipálva, egész évben foglalható." className="sm:col-span-2">
                  <div className="mt-1 flex flex-wrap gap-2">
                    {MONTHS.map((m, i) => (
                      <label key={m} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={p.months.includes(i + 1)}
                          onChange={(e) => set("months", e.target.checked ? [...p.months, i + 1] : p.months.filter((x) => x !== i + 1))}
                          className="accent-lime-dark"
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            </Card>
          )}

          <Card title="Képek" hint="Az első kép (vagy a borítónak jelölt) jelenik meg a kártyán; a sorrend a galéria sorrendje.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.gallery.map((src, i) => {
                const cover = (p.image || p.gallery[0]) === src;
                return (
                  <div key={src + i} className={`overflow-hidden rounded-md border-2 ${cover ? "border-lime" : "border-transparent"} bg-paper`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="aspect-[4/3] w-full object-cover" />
                    <div className="flex items-center justify-between gap-1 p-1.5 text-xs">
                      <button type="button" onClick={() => set("image", src)} className={cover ? "font-bold text-[#4b7a0a]" : "text-muted hover:text-ink"}>
                        {cover ? "★ borító" : "borító"}
                      </button>
                      <span className="flex gap-1">
                        <button type="button" onClick={() => moveImg(i, -1)} className="rounded px-1.5 hover:bg-white" aria-label="balra">
                          ←
                        </button>
                        <button type="button" onClick={() => moveImg(i, 1)} className="rounded px-1.5 hover:bg-white" aria-label="jobbra">
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => setP((x) => ({ ...x, gallery: x.gallery.filter((_, j) => j !== i), image: x.image === src ? null : x.image }))}
                          className="rounded px-1.5 text-brand-red hover:bg-white"
                          aria-label="törlés"
                        >
                          ✕
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-[#ccc] p-4 text-sm text-muted hover:border-lime">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
              {uploading ? "Feltöltés…" : "+ Képek feltöltése (JPG, PNG, WebP – max. 8 MB)"}
            </label>
          </Card>
        </div>

        <Card title="Szövegek" hint="Az angol a fő szöveg. Mentéskor a hiányzó (vagy még angol) mezőket a rendszer automatikusan lefordítja a többi nyelvre; a meglévő fordításokat és URL-eket nem írja felül.">
          <div className="mb-3 flex flex-wrap gap-2">
            <button type="button" disabled={translating} onClick={() => doRetranslate(LANGS.filter((l) => l !== "en"))} className="rounded border border-[#ccc] px-3 py-1.5 text-sm hover:border-slate disabled:opacity-50">
              {translating ? "Fordítás…" : "↻ Minden nyelv újrafordítása angolból"}
            </button>
            {lang !== "en" && (
              <button type="button" disabled={translating} onClick={() => doRetranslate([lang])} className="rounded border border-[#ccc] px-3 py-1.5 text-sm hover:border-slate disabled:opacity-50">
                ↻ {LANG_LABEL[lang].code} újrafordítása angolból
              </button>
            )}
          </div>
          <div className="mb-4 flex flex-wrap gap-1">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm ${lang === l ? "bg-slate text-white" : "bg-paper hover:bg-[#e2e2e2]"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LANG_LABEL[l].flag} alt="" className="h-3 w-4 object-cover" />
                {LANG_LABEL[l].code}
                {p.i18n[l]?.title ? "" : <span className="text-[10px] opacity-60">(üres)</span>}
              </button>
            ))}
          </div>

          <div className="space-y-3" key={lang}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={`Cím${lang === "en" ? " *" : ""}`}>
                <input value={text.title} onChange={(e) => setText("title", e.target.value)} className="field mt-1" />
              </Field>
              <Field label="Kártyán megjelenő cím" hint="Ha üres, a cím jelenik meg.">
                <input value={text.cardTitle || ""} onChange={(e) => setText("cardTitle", e.target.value || undefined)} className="field mt-1" />
              </Field>
              <Field label="URL (slug)" hint="Ha üres, a címből készül. Meglévő terméknél ne változtasd (SEO).">
                <input value={text.slug} onChange={(e) => setText("slug", e.target.value)} className="field mt-1 font-mono" />
              </Field>
              <Field label="Helyszín (kártyán)">
                <input value={text.location || ""} onChange={(e) => setText("location", e.target.value)} className="field mt-1" placeholder="Paris" />
              </Field>
            </div>
            <Field label="Címkék a képen" hint="Soronként: szöveg | szín, pl. Highly Recommended | #537ce8">
              <textarea
                rows={2}
                value={(text.labels || []).map((l) => `${l.text} | ${l.bg}`).join("\n")}
                onChange={(e) =>
                  setText(
                    "labels",
                    unlines(e.target.value).map((row) => {
                      const [t, bg] = row.split("|").map((s) => s.trim());
                      return { text: t || "", bg: bg || "#537ce8" };
                    }),
                  )
                }
                className="field mt-1 font-mono text-xs"
              />
            </Field>
            <Field label="Meta leírás (Google)">
              <textarea rows={2} value={text.metaDescription || ""} onChange={(e) => setText("metaDescription", e.target.value)} className="field mt-1" />
            </Field>
            <Field label="A csomag tartalma" hint="Soronként egy tétel. Ha üres, a cím jelenik meg.">
              <textarea rows={2} value={lines(text.package)} onChange={(e) => setText("package", unlines(e.target.value))} className="field mt-1" />
            </Field>
            <Field label="Áttekintés (HTML)" hint="<h2>, <p>, <ul><li>, <strong> használható.">
              <textarea rows={12} value={text.overview || ""} onChange={(e) => setText("overview", e.target.value)} className="field mt-1 font-mono text-xs" />
            </Field>
            <Field label="Mi van benne (soronként)">
              <textarea rows={3} value={lines(text.included)} onChange={(e) => setText("included", unlines(e.target.value))} className="field mt-1" />
            </Field>
            <Field label="Információk (HTML)">
              <textarea rows={5} value={text.info || ""} onChange={(e) => setText("info", e.target.value)} className="field mt-1 font-mono text-xs" />
            </Field>
            <Field label="További információ (HTML)">
              <textarea rows={5} value={text.additional || ""} onChange={(e) => setText("additional", e.target.value)} className="field mt-1 font-mono text-xs" />
            </Field>
            <Field label="Cím / helyszín leírása">
              <input value={text.address || ""} onChange={(e) => setText("address", e.target.value)} className="field mt-1" />
            </Field>
            <Field label="Lemondási feltételek (HTML)">
              <textarea rows={6} value={text.cancellation || ""} onChange={(e) => setText("cancellation", e.target.value)} className="field mt-1 font-mono text-xs" />
            </Field>
          </div>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ddd] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 md:px-6">
          <button type="button" onClick={save} disabled={saving} className="btn-lime px-8 py-2.5 font-bold disabled:opacity-60">
            {saving ? "Mentés és fordítás…" : "Mentés"}
          </button>
          {msg && <span className={`text-sm ${msg.ok ? "text-[#166534]" : "text-brand-red"}`}>{msg.text}</span>}
          {!isNew && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Biztosan törlöd: ${enTitle}? Ez nem visszavonható. (Elrejtéshez inkább vedd ki az „Aktív” pipát.)`)) startSave(() => removeProduct(p.id));
              }}
              className="ml-auto text-sm text-brand-red hover:underline"
            >
              Termék törlése
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
