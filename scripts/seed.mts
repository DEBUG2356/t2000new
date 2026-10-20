// Fills the Supabase "products" table from the archived data. Existing rows are only
// overwritten with --force (otherwise products edited in the admin panel are kept).
// Usage: npx tsx scripts/seed.mts [--force]
import fs from "node:fs";
import { buildSeedProducts } from "../src/lib/seed";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const url = process.env.SUPABASE_URL || env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || env.SUPABASE_SECRET_KEY;
const force = process.argv.includes("--force");

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const existing: { id: number }[] = await (await fetch(`${url}/rest/v1/products?select=id`, { headers })).json();
const have = new Set(existing.map((r) => r.id));

const rows = buildSeedProducts()
  .filter((p) => force || !have.has(p.id))
  .map((p) => ({
    id: p.id,
    active: p.active,
    sort: p.sort,
    categories: p.categories,
    primary_category: p.primaryCategory,
    image: p.image,
    gallery: p.gallery,
    rating: p.rating,
    review_count: p.reviewCount,
    bars: p.bars,
    lat: p.lat,
    lng: p.lng,
    props: p.props,
    i18n: p.i18n,
    legacy_urls: p.legacyUrls,
    reviews: p.reviews,
    tickets: p.tickets,
    min_qty: p.minQty,
    closed_weekdays: p.closedWeekdays,
    closed_dates: p.closedDates,
    months: p.months,
    time_slots: p.timeSlots,
  }));

if (!rows.length) {
  console.log("nothing to insert (use --force to overwrite)");
} else {
  const res = await fetch(`${url}/rest/v1/products?on_conflict=id`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(rows),
  });
  console.log(res.status, res.ok ? `${rows.length} products upserted` : await res.text());
}
