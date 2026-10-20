"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CATEGORIES } from "@/data/shop";
import { checkPassword, endSession, requireAdmin, startSession } from "@/lib/server/admin-auth";
import { addClosure, CATALOG_TAG, deleteProduct, fetchClosures, fetchSlugIndex, removeClosure, updateOrders, upsertProduct, uploadImage } from "@/lib/server/db";
import { generateSlots, normTime } from "@/lib/slots";
import { translateProduct } from "@/lib/translate-core";
import type { Lang } from "@/lib/site";
import { clientIpFromHeaders, limited } from "@/lib/server/rate-limit";
import { LANGS } from "@/lib/site";
import { TICKET_TYPES, type OrderStatus, type Product } from "@/lib/types";

export async function login(_: unknown, fd: FormData) {
  const ip = await clientIpFromHeaders();
  if (limited(`admin-login:${ip}`, 10, 15 * 60_000)) return { error: "Túl sok próbálkozás, próbáld újra 15 perc múlva." };
  if (!checkPassword(String(fd.get("password") || ""))) return { error: "Hibás jelszó." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin();
  if (!["pending", "paid", "cancelled", "refunded"].includes(status)) return;
  await updateOrders(`id=eq.${encodeURIComponent(id)}`, { status, ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}) });
}

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

const num = (v: unknown) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));

/** Validates and stores a product coming from the editor */
export async function saveProduct(input: Product): Promise<{ ok: true; id: number; translated: Lang[]; i18n: Product["i18n"]; warning?: string } | { ok: false; error: string }> {
  await requireAdmin();
  // only ids, categories and slugs – not the whole product table
  const index = await fetchSlugIndex();
  const p: Product = structuredClone(input);

  if (!p.id) p.id = Math.max(0, ...index.map((x) => x.id)) + 1;
  p.categories = p.categories.filter((c) => CATEGORIES.some((x) => x.id === c));
  if (!p.categories.length) return { ok: false, error: "Legalább egy kategóriát válassz." };
  if (!p.primaryCategory || !p.categories.includes(p.primaryCategory)) p.primaryCategory = p.categories[0];

  // texts: English is required, slugs are generated from the titles when empty
  for (const l of LANGS) {
    const t = p.i18n[l];
    if (!t) continue;
    t.title = t.title.trim();
    if (!t.title && l !== "en") {
      delete p.i18n[l];
      continue;
    }
    t.slug = slugify(t.slug || t.title);
    t.included = (t.included || []).map((s) => s.trim()).filter(Boolean);
    t.package = (t.package || []).map((s) => s.trim()).filter(Boolean);
    t.labels = (t.labels || []).filter((x) => x.text.trim());
  }
  if (!p.i18n.en?.title) return { ok: false, error: "Az angol cím kötelező." };

  // missing / still-English texts of the other languages are translated automatically
  let translated: Lang[] = [];
  let warning: string | undefined;
  const aiKey = process.env.GEMINI_API_KEY?.trim();
  if (aiKey) {
    const r = await translateProduct(p, [...LANGS], aiKey);
    p.i18n = r.i18n;
    translated = r.done;
    if (r.failed.length) warning = `Néhány nyelv fordítása nem sikerült (${r.failed.map((f) => f.split(":")[0]).join(", ")}), próbáld újra a mentést.`;
  }

  // slugs must be unique inside the shared categories of every language – a clash gets a "-2", "-3" … suffix
  const renamed: string[] = [];
  for (const l of LANGS) {
    const t = p.i18n[l];
    if (!t) continue;
    const taken = new Set(index.filter((o) => o.id !== p.id && (o.categories || []).some((c) => p.categories.includes(c))).map((o) => o[l] || o.en));
    if (!taken.has(t.slug)) continue;
    const base = t.slug.replace(/-\d+$/, "");
    let n = 2;
    while (taken.has(`${base}-${n}`)) n++;
    t.slug = `${base}-${n}`;
    renamed.push(`${l.toUpperCase()}: ${t.slug}`);
  }

  // ticket types: one per type, positive prices
  const seen = new Set<string>();
  p.tickets = p.tickets
    .filter((t) => TICKET_TYPES.includes(t.type) && !seen.has(t.type) && seen.add(t.type))
    .map((t) => ({ type: t.type, price: Math.max(0, num(t.price) ?? 0), oldPrice: num(t.oldPrice) || null, ...(t.age?.trim() ? { age: t.age.trim() } : {}) }));
  p.tickets.sort((a, b) => TICKET_TYPES.indexOf(a.type) - TICKET_TYPES.indexOf(b.type));

  // combo: 2+ existing, non-combo base tickets
  p.components = [...new Set((p.components || []).map(Number))].filter((id) => id !== p.id && index.some((o) => o.id === id && !(o.components || []).length));
  if (p.components.length === 1) return { ok: false, error: "Kombóhoz legalább 2 alap jegy kell." };

  p.minQty = Math.max(1, Math.floor(num(p.minQty) ?? 1));
  p.sort = Math.floor(num(p.sort) ?? 0);
  p.rating = num(p.rating);
  p.reviewCount = num(p.reviewCount);
  p.lat = num(p.lat);
  p.lng = num(p.lng);
  p.closedDates = p.closedDates.map((d) => d.trim()).filter((d) => /^\d{2}-\d{2}$/.test(d));
  // time slots are generated from the opening hours
  p.slotFrom = normTime(p.slotFrom);
  p.slotTo = normTime(p.slotTo);
  p.slotStep = Math.floor(num(p.slotStep) ?? 30) || 30;
  p.timeSlots = generateSlots(p.slotFrom, p.slotTo, p.slotStep);
  if (!p.timeSlots.length) p.slotFrom = p.slotTo = p.slotStep = null;
  p.gallery = p.gallery.filter(Boolean);
  if (p.image && !p.gallery.includes(p.image)) p.image = p.gallery[0] || null;

  try {
    await upsertProduct(p);
  } catch (e) {
    return { ok: false, error: `Mentési hiba: ${(e as Error).message}` };
  }
  updateTag(CATALOG_TAG);
  if (renamed.length) warning = [warning, `Foglalt URL helyett új URL: ${renamed.join(", ")}.`].filter(Boolean).join(" ");
  return { ok: true, id: p.id, translated, i18n: p.i18n, warning };
}

/** After editing the tables directly in Supabase: drop the cached catalog */
export async function refreshCatalog() {
  await requireAdmin();
  updateTag(CATALOG_TAG);
}

export async function removeProduct(id: number) {
  await requireAdmin();
  await deleteProduct(id);
  updateTag(CATALOG_TAG);
  redirect("/admin/products");
}

export async function uploadProductImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Nincs fájl." };
  if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return { error: "Csak JPG, PNG, WebP vagy AVIF kép tölthető fel." };
  if (file.size > 8 * 1024 * 1024) return { error: "A kép legfeljebb 8 MB lehet." };
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const name = `${slugify(file.name.replace(/\.[^.]+$/, "")) || "image"}-${Date.now().toString(36)}.${ext}`;
  try {
    const url = await uploadImage(`products/${name}`, await file.arrayBuffer(), file.type);
    return { url };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ------------------------------------------------------------ calendar (small targeted queries only)
const isYmd = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d);

/** Closures of one product for the visible month (a single small query) */
export async function loadCalendar(productId: number, from: string, to: string) {
  await requireAdmin();
  if (!isYmd(from) || !isYmd(to)) return { closures: [] };
  return { closures: await fetchClosures(productId, from, to) };
}

/** Close or reopen one day (slot "") or one time slot – a single row insert/delete */
export async function setClosure(productId: number, date: string, slot: string, closed: boolean) {
  await requireAdmin();
  if (!isYmd(date) || (slot && !/^\d{2}:\d{2}$/.test(slot))) return { ok: false };
  if (closed) await addClosure(productId, date, slot);
  else await removeClosure(productId, date, slot);
  return { ok: true };
}

/** Close / reopen several days at once (e.g. a whole week) */
export async function setClosures(productId: number, dates: string[], closed: boolean) {
  await requireAdmin();
  const list = dates.filter(isYmd).slice(0, 62);
  await Promise.all(list.map((d) => (closed ? addClosure(productId, d, "") : removeClosure(productId, d, ""))));
  return { ok: true };
}

/** "Újrafordítás angolból": overwrites the texts of the given languages from English (not saved yet) */
export async function retranslate(input: Product, langs: Lang[]): Promise<{ i18n?: Product["i18n"]; error?: string }> {
  await requireAdmin();
  const aiKey = process.env.GEMINI_API_KEY?.trim();
  if (!aiKey) return { error: "Nincs beállítva GEMINI_API_KEY." };
  const r = await translateProduct(input, langs.filter((l) => l !== "en"), aiKey, true);
  if (r.failed.length && !r.done.length) return { error: r.failed.join(" | ") };
  return { i18n: r.i18n, ...(r.failed.length ? { error: `Nem sikerült: ${r.failed.map((f) => f.split(":")[0]).join(", ")}` } : {}) };
}
