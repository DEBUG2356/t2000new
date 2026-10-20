import Link from "next/link";
import StatusSelect from "@/components/admin/StatusSelect";
import { dbConfigured, listOrders } from "@/lib/server/db";
import { TICKET_TYPES, type Order } from "@/lib/types";

export const metadata = { title: "Rendelések" };

const STATUSES = [
  { v: "paid", label: "Fizetve" },
  { v: "pending", label: "Fizetésre vár" },
  { v: "cancelled", label: "Törölve" },
  { v: "refunded", label: "Visszatérítve" },
  { v: "all", label: "Mind" },
];
const DAYS = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];
const fmtDate = (d: string) => `${d.replaceAll("-", ".")}. ${DAYS[new Date(d + "T12:00:00").getDay()]}`;
const fmtTime = (iso: string) => new Date(iso).toLocaleString("hu-HU", { timeZone: "Europe/Budapest", dateStyle: "short", timeStyle: "short" });
const money = (v: number, c: string) => `${c === "USD" ? "$" : "€"} ${Number(v).toFixed(2).replace(".", ",")}`;

export default async function OrdersPage({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? sp.status : "paid";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const when = typeof sp.when === "string" ? sp.when : "upcoming";

  if (!dbConfigured()) return <p>A Supabase nincs beállítva (SUPABASE_URL, SUPABASE_SECRET_KEY).</p>;

  const filters = ["select=*", "limit=1000"];
  if (status !== "all") filters.push(`status=eq.${status}`);
  if (q) {
    const s = q.replace(/[,()*]/g, " ");
    filters.push(`or=(name.ilike.*${encodeURIComponent(s)}*,email.ilike.*${encodeURIComponent(s)}*,ref.ilike.*${encodeURIComponent(s)}*,product_name.ilike.*${encodeURIComponent(s)}*,combo_name.ilike.*${encodeURIComponent(s)}*)`);
  }
  const today = new Date().toISOString().slice(0, 10);
  if (when === "upcoming") filters.push(`date=gte.${today}`);
  else if (when === "past") filters.push(`date=lt.${today}`);
  // newest order first; the rows of one purchase (combo parts) stay together in their own order
  filters.push("order=created_at.desc,group_ref.desc,ref.asc");

  let orders: Order[] = [];
  let error = "";
  try {
    orders = await listOrders(filters.join("&"));
  } catch (e) {
    error = (e as Error).message;
  }
  const sum = orders.reduce((s, o) => s + (o.currency === "EUR" ? Number(o.total) : 0), 0);
  const link = (patch: Record<string, string>) => `/admin?${new URLSearchParams({ status, when, ...(q ? { q } : {}), ...patch })}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <h1 className="mr-4 text-2xl font-bold">Rendelések</h1>
        <div className="flex flex-wrap gap-1 rounded-lg bg-white p-1 shadow-sm">
          {STATUSES.map((s) => (
            <Link key={s.v} href={link({ status: s.v })} className={`rounded-md px-3 py-1.5 text-sm ${status === s.v ? "bg-slate text-white" : "hover:bg-paper"}`}>
              {s.label}
            </Link>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg bg-white p-1 shadow-sm">
          {[
            ["upcoming", "Közelgő"],
            ["past", "Elmúlt"],
            ["all", "Minden dátum"],
          ].map(([v, l]) => (
            <Link key={v} href={link({ when: v })} className={`rounded-md px-3 py-1.5 text-sm ${when === v ? "bg-slate text-white" : "hover:bg-paper"}`}>
              {l}
            </Link>
          ))}
        </div>
        <form className="ml-auto flex gap-2">
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="when" value={when} />
          <input name="q" defaultValue={q} placeholder="Név, e-mail, ref, termék…" className="field w-64" />
          <button className="btn-lime px-4">Keresés</button>
        </form>
      </div>

      {error && <p className="mb-3 rounded bg-red-100 p-3 text-sm text-red-800">{error}</p>}

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[1200px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#2f3442] text-left text-xs font-semibold text-white">
              <th className="px-3 py-2.5">E-mail</th>
              <th className="px-3 py-2.5">Név</th>
              {TICKET_TYPES.map((k) => (
                <th key={k} className="px-2 py-2.5 text-center capitalize">
                  {k}
                </th>
              ))}
              <th className="px-3 py-2.5">Dátum</th>
              <th className="px-3 py-2.5">Idősáv</th>
              <th className="px-3 py-2.5">Termék</th>
              <th className="px-3 py-2.5 text-right">Összeg</th>
              <th className="px-3 py-2.5">Státusz</th>
              <th className="px-3 py-2.5">Rendelve</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className={`border-b border-[#eee] align-top hover:bg-[#fafafa] ${o.combo_id ? "border-l-4 border-l-[#c4b5fd]" : ""}`}>
                <td className="px-3 py-2">
                  <a href={`mailto:${o.email}`} className="hover:underline">
                    {o.email}
                  </a>
                  {o.phone && <div className="text-xs text-muted">{o.phone}</div>}
                </td>
                <td className="px-3 py-2 font-semibold">
                  {o.name}
                  {o.notes && <div className="max-w-[220px] text-xs font-normal whitespace-pre-wrap text-[#b45309]">📝 {o.notes}</div>}
                </td>
                {TICKET_TYPES.map((k) => (
                  <td key={k} className={`px-2 py-2 text-center ${o[k] ? "font-bold" : "text-[#c4c4c4]"}`}>
                    {o[k]}
                  </td>
                ))}
                <td className="px-3 py-2 whitespace-nowrap">{fmtDate(o.date)}</td>
                <td className="px-3 py-2">{o.time_slot || "—"}</td>
                <td className="px-3 py-2">
                  <span className="inline-block rounded bg-[#dbeafe] px-2 py-0.5 text-[#1e3a8a]">{o.product_name}</span>
                  {o.combo_name && (
                    <div className="mt-1 text-[11px] leading-tight text-[#7c3aed]" title={o.combo_name}>
                      🔗 Kombó: {o.combo_name}
                    </div>
                  )}
                  <div className="mt-0.5 font-mono text-[11px] text-muted">{o.ref}</div>
                </td>
                <td className="px-3 py-2 text-right whitespace-nowrap">{money(o.total, o.currency)}</td>
                <td className="px-3 py-2">
                  <StatusSelect id={o.id} value={o.status} />
                </td>
                <td className="px-3 py-2 text-xs whitespace-nowrap text-muted">{fmtTime(o.created_at)}</td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={15} className="px-3 py-10 text-center text-muted">
                  Nincs találat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">
        {orders.length} rendelés · összesen {money(sum, "EUR")} (EUR-ban fizetett rendelések)
      </p>
    </div>
  );
}
