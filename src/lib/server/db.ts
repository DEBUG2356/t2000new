import "server-only";
import type { Order, Product } from "@/lib/types";

// Thin Supabase REST (PostgREST) client with the secret key – server only.
export const supabaseUrl = () => process.env.SUPABASE_URL?.trim().replace(/\/$/, "") || "";
const key = () => process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
export const dbConfigured = () => !!(supabaseUrl() && key());

export const CATALOG_TAG = "catalog";

type Init = RequestInit & { next?: { tags?: string[]; revalidate?: number | false } };

export async function rest<T>(path: string, init: Init = {}): Promise<T> {
  const res = await fetch(`${supabaseUrl()}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key(),
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text().catch(() => "")}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

// ------------------------------------------------------------ products
type ProductRow = {
  id: number;
  active: boolean;
  sort: number;
  categories: string[];
  primary_category: string | null;
  image: string | null;
  gallery: string[];
  rating: number | string | null;
  review_count: number | null;
  bars: number[] | null;
  lat: number | null;
  lng: number | null;
  props: Product["props"];
  i18n: Product["i18n"];
  legacy_urls: Product["legacyUrls"];
  reviews: Product["reviews"];
  tickets: Product["tickets"];
  min_qty: number;
  closed_weekdays: number[];
  closed_dates: string[];
  months: number[];
  time_slots: string[];
  slot_from: string | null;
  slot_to: string | null;
  slot_step: number | null;
  components: number[];
  updated_at?: string;
};

export const fromRow = (r: ProductRow): Product => ({
  id: r.id,
  active: r.active,
  sort: r.sort,
  categories: r.categories || [],
  primaryCategory: r.primary_category,
  image: r.image,
  gallery: r.gallery || [],
  rating: r.rating == null ? null : Number(r.rating),
  reviewCount: r.review_count,
  bars: r.bars,
  lat: r.lat,
  lng: r.lng,
  props: r.props || [],
  i18n: r.i18n || {},
  legacyUrls: r.legacy_urls || {},
  reviews: r.reviews || [],
  tickets: (r.tickets || []).map((t) => ({ ...t, price: Number(t.price), oldPrice: t.oldPrice == null ? null : Number(t.oldPrice) })),
  minQty: r.min_qty || 1,
  closedWeekdays: r.closed_weekdays || [],
  closedDates: r.closed_dates || [],
  months: r.months || [],
  timeSlots: r.time_slots || [],
  slotFrom: r.slot_from,
  slotTo: r.slot_to,
  slotStep: r.slot_step,
  components: r.components || [],
  updatedAt: r.updated_at,
});

export const toRow = (p: Product): ProductRow => ({
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
  slot_from: p.slotFrom,
  slot_to: p.slotTo,
  slot_step: p.slotStep,
  components: p.components,
  updated_at: new Date().toISOString(),
});

/** All products, cached under the "catalog" tag (the admin panel invalidates it on save). */
export async function fetchProducts(): Promise<Product[]> {
  const rows = await rest<ProductRow[]>("products?select=*&order=sort.asc,id.asc", { cache: "force-cache", next: { tags: [CATALOG_TAG] } });
  return rows.map(fromRow);
}

/** Uncached read for the admin panel */
export async function fetchProductsFresh(): Promise<Product[]> {
  const rows = await rest<ProductRow[]>("products?select=*&order=sort.asc,id.asc", { cache: "no-store" });
  return rows.map(fromRow);
}

/** One product, uncached (admin editor) */
export async function fetchProductFresh(id: number): Promise<Product | null> {
  const rows = await rest<ProductRow[]>(`products?select=*&id=eq.${id}`, { cache: "no-store" });
  return rows[0] ? fromRow(rows[0]) : null;
}

/** Light product list for the admin table: only the columns it shows, no long texts */
export type ProductSummary = Pick<Product, "id" | "active" | "sort" | "categories" | "image" | "tickets" | "components"> & { title: string; slug: string; langs: string[]; cover: string | null };
export async function fetchProductSummaries(): Promise<ProductSummary[]> {
  const rows = await rest<
    { id: number; active: boolean; sort: number; categories: string[]; image: string | null; cover: string | null; tickets: Product["tickets"]; components: number[]; title: string | null; card: string | null; slug: string | null }[]
  >("products?select=id,active,sort,categories,image,cover:gallery->>0,tickets,components,title:i18n->en->>title,card:i18n->en->>cardTitle,slug:i18n->en->>slug&order=sort.asc,id.asc", { cache: "no-store" });
  // the language list comes from a cheap second query on the keys only
  const keys = await rest<{ id: number; k: string[] }[]>("rpc/product_langs", { method: "POST", body: "{}", cache: "no-store" }).catch(() => []);
  const langMap = new Map(keys.map((r) => [r.id, r.k]));
  return rows.map((r) => ({
    id: r.id,
    active: r.active,
    sort: r.sort,
    categories: r.categories || [],
    image: r.image,
    cover: r.image || r.cover,
    tickets: (r.tickets || []).map((t) => ({ ...t, price: Number(t.price) })),
    components: r.components || [],
    title: r.card || r.title || `#${r.id}`,
    slug: r.slug || "",
    langs: langMap.get(r.id) || [],
  }));
}

/** id + categories + slug per language – for the URL uniqueness check when saving */
export async function fetchSlugIndex() {
  const cols = ["en", "fr", "es", "de", "sk", "it"].map((l) => `${l}:i18n->${l}->>slug`).join(",");
  return rest<({ id: number; categories: string[]; components: number[] } & Record<string, string | null>)[]>(`products?select=id,categories,components,${cols}`, { cache: "no-store" });
}

export async function upsertProduct(p: Product) {
  await rest("products?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(toRow(p)), cache: "no-store" });
}

export async function deleteProduct(id: number) {
  await rest(`products?id=eq.${id}`, { method: "DELETE", cache: "no-store" });
}

// ------------------------------------------------------------ orders
export async function insertOrders(rows: Partial<Order>[]) {
  return rest<Order[]>("orders", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(rows), cache: "no-store" });
}

export async function updateOrders(filter: string, patch: Partial<Order> & Record<string, unknown>) {
  return rest<Order[]>(`orders?${filter}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(patch), cache: "no-store" });
}

export async function listOrders(query: string) {
  return rest<Order[]>(`orders?${query}`, { cache: "no-store" });
}

// ------------------------------------------------------------ closures (calendar)
/** Closed days ("" slot) and closed time slots of one product between two dates */
export async function fetchClosures(productId: number, from: string, to: string) {
  return rest<{ date: string; slot: string }[]>(`closures?select=date,slot&product_id=eq.${productId}&date=gte.${from}&date=lte.${to}`, { cache: "no-store" });
}

export async function addClosure(productId: number, date: string, slot: string) {
  await rest("closures?on_conflict=product_id,date,slot", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ product_id: productId, date, slot }),
    cache: "no-store",
  });
}

export async function removeClosure(productId: number, date: string, slot: string) {
  await rest(`closures?product_id=eq.${productId}&date=eq.${date}&slot=eq.${encodeURIComponent(slot)}`, { method: "DELETE", cache: "no-store" });
}

// ------------------------------------------------------------ storage
export async function uploadImage(path: string, body: ArrayBuffer, contentType: string) {
  const res = await fetch(`${supabaseUrl()}/storage/v1/object/media/${path}`, {
    method: "POST",
    headers: { apikey: key(), Authorization: `Bearer ${key()}`, "Content-Type": contentType, "x-upsert": "true" },
    body,
  });
  if (!res.ok) throw new Error(`Upload ${res.status}: ${await res.text().catch(() => "")}`);
  return `${supabaseUrl()}/storage/v1/object/public/media/${path}`;
}
