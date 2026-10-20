// Builds the initial product rows from the Wayback extraction (catalog.json), the hand-written
// texts (extra.ts), the archived prices (shop.ts) and the replacement photos (credits.json).
// Used once to fill Supabase and as an offline fallback when Supabase is not configured.
import raw from "@/data/catalog.json";
import credits from "@/data/credits.json";
import { COORDS, EXTRA_EN } from "@/data/extra";
import { CATEGORIES, SEED_PRICING } from "@/data/shop";
import { LANGS, type Lang } from "./site";
import type { LangText, Product, Prop } from "./types";

type RawText = {
  title: string;
  cardTitle: string;
  location: string;
  props: string[];
  labels: { text: string; bg: string }[];
  metaDescription?: string;
  package?: string[];
  overview?: string;
  included?: string[];
  info?: string;
  additional?: string;
  address?: string;
  cancellation?: string;
};
type RawProduct = {
  id: number;
  slugs: Partial<Record<Lang, string>>;
  hrefs: Partial<Record<Lang, string[]>>;
  image: string | null;
  gallery: string[];
  rating: number | null;
  reviewCount: number | null;
  bars: number[] | null;
  lat: number | null;
  lng: number | null;
  reviews: { stars: number; date: string; text: string }[];
  i18n: Partial<Record<Lang, RawText>>;
};

const hasDetail = (t?: RawText) => !!t && !!(t.overview || t.additional || t.cancellation);

function parseProps(src: string[]): Prop[] {
  return src.map((s) => {
    if (/^Duration: (\d+)/.test(s)) return { key: "duration", n: +s.match(/\d+/)![0] };
    if (/Full Day/i.test(s)) return { key: "fullDay" };
    if (/Free Cancel/i.test(s)) return { key: "freeCancel" };
    if (/Instant/i.test(s)) return { key: "instant" };
    if (/Mobile/i.test(s)) return { key: "mobile" };
    return { key: "flexible" };
  });
}

export function buildSeedProducts(): Product[] {
  const data = raw as unknown as { products: RawProduct[] };
  const media = credits as Record<string, { file: string }[]>;
  // global order: first appearance in the category lists (home sliders first)
  const orderCats = ["top-offers", "boat-tours", "near-to-paris", "paris", "eiffel-tower", "louvre", "barcelona", "tenerifa", "slovakia", "madrid"];
  const order: number[] = [];
  for (const id of orderCats) for (const pid of CATEGORIES.find((c) => c.id === id)?.seed || []) if (!order.includes(pid)) order.push(pid);

  return data.products.map((p) => {
    const cats = CATEGORIES.filter((c) => c.seed.includes(p.id)).map((c) => c.id);
    const enHref = p.hrefs.en?.[0];
    const hrefCat = enHref ? CATEGORIES.find((c) => c.slugs.en === enHref.split("/").filter(Boolean)[0])?.id : undefined;
    const primary = hrefCat || cats[0] || null;
    if (primary && !cats.includes(primary)) cats.push(primary);

    const i18n: Partial<Record<Lang, LangText>> = {};
    for (const l of LANGS) {
      const t = p.i18n[l];
      const detail: Partial<LangText> = hasDetail(t) ? t! : l === "en" && EXTRA_EN[p.id] ? EXTRA_EN[p.id] : {};
      if (!t && !Object.keys(detail).length) continue;
      i18n[l] = {
        title: t?.title || t?.cardTitle || "",
        cardTitle: t?.cardTitle || undefined,
        slug: p.slugs[l] || p.slugs.en || String(p.id),
        location: t?.location || "",
        labels: t?.labels || [],
        metaDescription: t?.metaDescription || "",
        package: detail.package,
        overview: detail.overview,
        included: detail.included,
        info: detail.info,
        additional: detail.additional,
        address: detail.address,
        cancellation: detail.cancellation,
      };
    }
    const pricing = SEED_PRICING[p.id] ?? { price: null };
    const coords = p.lat != null && p.lng != null ? [p.lat, p.lng] : COORDS[p.id] || [null, null];
    const gallery = [...new Set([p.image, ...p.gallery, ...(media[`p${p.id}`] || []).map((m) => m.file)].filter(Boolean) as string[])];
    const enText = p.i18n.en || Object.values(p.i18n)[0];
    return {
      id: p.id,
      active: true,
      sort: order.includes(p.id) ? order.indexOf(p.id) : 100 + p.id,
      categories: cats,
      primaryCategory: primary,
      image: gallery[0] || null,
      gallery,
      rating: p.rating,
      reviewCount: p.reviewCount,
      bars: p.bars,
      lat: coords[0],
      lng: coords[1],
      props: parseProps(enText?.props || []),
      i18n,
      legacyUrls: p.hrefs,
      reviews: p.reviews.map(({ stars, date, text }) => ({ stars, date, text })),
      tickets: pricing.price != null ? [{ type: "adult", price: pricing.price, oldPrice: pricing.oldPrice ?? null }] : [],
      minQty: pricing.minQty ?? 1,
      closedWeekdays: pricing.closedWeekdays ?? [],
      closedDates: pricing.closedDates ?? [],
      months: pricing.months ?? [],
      timeSlots: [],
      slotFrom: null,
      slotTo: null,
      slotStep: null,
      components: [],
    } satisfies Product;
  });
}
