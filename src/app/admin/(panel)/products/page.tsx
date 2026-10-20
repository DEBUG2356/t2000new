import Link from "next/link";
import { refreshCatalog } from "@/app/admin/actions";
import { CATEGORIES } from "@/data/shop";
import { fetchProductSummaries } from "@/lib/server/db";
import { fromPrice } from "@/lib/types";

export const metadata = { title: "Termékek" };

const catName = (id: string) => CATEGORIES.find((c) => c.id === id)?.title.en || id;

export default async function ProductsPage() {
  // only the columns the table shows (no descriptions, reviews, galleries)
  const products = await fetchProductSummaries();
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Termékek</h1>
        <span className="text-sm text-muted">{products.length} db</span>
        <form action={refreshCatalog} className="ml-auto">
          <button className="rounded border border-[#ccc] bg-white px-3 py-2 text-sm hover:border-slate" title="Ha közvetlenül a Supabase-ben módosítottál adatot">
            ↻ Weboldal frissítése
          </button>
        </form>
        <Link href="/admin/products/new" className="btn-lime px-4 py-2 font-semibold">
          + Új termék
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-[#2f3442] text-left text-xs font-semibold text-white">
              <th className="px-3 py-2.5">Sorrend</th>
              <th className="px-3 py-2.5" colSpan={2}>
                Termék
              </th>
              <th className="px-3 py-2.5">Kategóriák</th>
              <th className="px-3 py-2.5">Jegytípusok</th>
              <th className="px-3 py-2.5">Ártól</th>
              <th className="px-3 py-2.5">Állapot</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const fp = fromPrice(p);
              const primary = CATEGORIES.find((c) => p.categories.includes(c.id));
              return (
                <tr key={p.id} className={`border-b border-[#eee] ${p.active ? "" : "opacity-50"}`}>
                  <td className="px-3 py-2 text-muted">{p.sort}</td>
                  <td className="w-16 px-3 py-2">
                    {p.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.cover} alt="" loading="lazy" className="size-12 rounded object-cover" />
                    ) : (
                      <div className="size-12 rounded bg-paper" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-brand-red">
                      {p.title}
                    </Link>
                    <div className="text-xs text-muted">
                      #{p.id} · {p.langs.join(", ")}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs">{p.categories.map(catName).join(", ")}</td>
                  <td className="px-3 py-2 text-xs">{p.tickets.map((t) => `${t.type} €${t.price}`).join(" · ") || <span className="text-brand-red">nincs ár – nem foglalható</span>}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{fp ? `€ ${fp.price.toFixed(2).replace(".", ",")}` : "—"}</td>
                  <td className="px-3 py-2">{p.active ? <span className="text-[#166534]">aktív</span> : <span className="text-muted">rejtett</span>}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {primary && p.slug && (
                      <a href={`/${primary.slugs.en}/${p.slug}`} target="_blank" className="mr-3 text-xs text-muted hover:text-ink">
                        megnéz ↗
                      </a>
                    )}
                    <Link href={`/admin/products/${p.id}`} className="rounded bg-slate px-3 py-1 text-xs text-white hover:bg-slate-deep">
                      Szerkesztés
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
