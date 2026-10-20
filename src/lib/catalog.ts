import raw from "@/data/catalog.json";
import credits from "@/data/credits.json";
import { CATEGORIES, type Category } from "@/data/shop";
import { LANGS, localePrefix, type Lang } from "./site";
import { fromPrice, type LangText, type Product } from "./types";

export type { Category, Product };

type RawPage = { type: string; paths?: Partial<Record<Lang, string>>; langs: Partial<Record<Lang, { path: string; title: string; metaTitle: string; html: string }>> };
const pages = (raw as unknown as { pages: Record<string, RawPage> }).pages;
const creditMap = credits as Record<string, { file: string; title: string; author: string; license: string; licenseUrl: string; source: string }[]>;

export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);
export const NAV_CATEGORIES = CATEGORIES.filter((c) => c.nav);

// ------------------------------------------------------------- texts
const own = (p: Product, lang: Lang): LangText | undefined => p.i18n[lang];
const anyText = (p: Product) => p.i18n.en || Object.values(p.i18n)[0];

export function productTitle(p: Product, lang: Lang) {
  return own(p, lang)?.cardTitle || own(p, lang)?.title || anyText(p)?.cardTitle || anyText(p)?.title || `#${p.id}`;
}
export function productHeading(p: Product, lang: Lang) {
  return own(p, lang)?.title || productTitle(p, lang);
}
export function productLocation(p: Product, lang: Lang) {
  return own(p, lang)?.location || anyText(p)?.location || "";
}
export function productLabels(p: Product, lang: Lang) {
  const l = own(p, lang)?.labels;
  return l && l.length ? l : anyText(p)?.labels || [];
}

const hasDetail = (t?: LangText) => !!t && !!(t.overview || t.additional || t.cancellation || t.info);

/** Product content: own language → English → any language */
export function productText(p: Product, lang: Lang): LangText {
  const o = own(p, lang);
  if (hasDetail(o)) return o!;
  if (hasDetail(p.i18n.en)) return p.i18n.en!;
  return Object.values(p.i18n).find(hasDetail) || o || anyText(p) || { title: "", slug: "" };
}
export function productPackage(p: Product, lang: Lang, parts?: Product[]) {
  const t = productText(p, lang);
  if (t.package && t.package.length) return t.package;
  if (parts && parts.length > 1) return parts.map((x) => productHeading(x, lang));
  return [productHeading(p, lang)];
}
export const productCoords = (p: Product): [number, number] | null => (p.lat != null && p.lng != null ? [p.lat, p.lng] : null);
export const productPrice = fromPrice;
export const isBookableProduct = (p: Product) => p.tickets.some((t) => t.price > 0);

// ------------------------------------------------------------- images
export const productImages = (p: Product) => [...new Set([p.image, ...p.gallery].filter(Boolean) as string[])];
export const productCover = (p: Product) => p.image || p.gallery[0] || "/images/fb-preview-img.jpg";
export const photoCredits = () => creditMap;

// ------------------------------------------------------------- urls
export const productSlug = (p: Product, lang: Lang) => own(p, lang)?.slug || p.i18n.en?.slug || anyText(p)?.slug || String(p.id);
export const primaryCategory = (p: Product): Category =>
  getCategory(p.primaryCategory || "") || CATEGORIES.find((c) => p.categories.includes(c.id)) || CATEGORIES[0];
export const categoryUrl = (c: Category, lang: Lang) => `${localePrefix(lang)}/${c.slugs[lang]}`;
export const productUrl = (p: Product, lang: Lang, cat?: Category) => `${localePrefix(lang)}/${(cat || primaryCategory(p)).slugs[lang]}/${productSlug(p, lang)}`;

// ------------------------------------------------------------- static pages
export type PageKey = "privacy" | "terms" | "refund" | "partner" | "contact" | "search" | "sitemap" | "credits" | "checkout" | "success" | "cancel";

const PAGE_SOURCE: Partial<Record<PageKey, string>> = {
  privacy: "/privacy-policy",
  terms: "/terms-and-conditions",
  refund: "/refund-policy",
  partner: "/become-a-partner",
  contact: "/contact",
  search: "/search",
  sitemap: "/sitemap",
};

const EXTRA_PATHS: Record<PageKey, Partial<Record<Lang, string>>> = {
  privacy: {},
  terms: {},
  refund: { fr: "/fr/politique-de-remboursement", es: "/es/politica-de-reembolso", de: "/de/rueckerstattungsrichtlinie", it: "/it/politica-di-rimborso" },
  partner: {},
  contact: {},
  search: {},
  sitemap: {},
  credits: { en: "/photo-credits", fr: "/fr/credits-photos", es: "/es/creditos-fotos", de: "/de/bildnachweise", sk: "/sk/zdroje-fotografii", it: "/it/crediti-fotografici" },
  checkout: { en: "/checkout", fr: "/fr/checkout", es: "/es/checkout", de: "/de/checkout", sk: "/sk/checkout", it: "/it/checkout" },
  success: { en: "/checkout/success", fr: "/fr/checkout/success", es: "/es/checkout/success", de: "/de/checkout/success", sk: "/sk/checkout/success", it: "/it/checkout/success" },
  cancel: { en: "/checkout/cancel", fr: "/fr/checkout/cancel", es: "/es/checkout/cancel", de: "/de/checkout/cancel", sk: "/sk/checkout/cancel", it: "/it/checkout/cancel" },
};

export function pageUrl(key: PageKey, lang: Lang): string {
  const src = PAGE_SOURCE[key];
  const fromData = src ? pages[src]?.paths?.[lang] : undefined;
  // the archive links untranslated refund pages to the language home page
  if (fromData && fromData !== `/${lang}`) return fromData;
  return EXTRA_PATHS[key][lang] || `${localePrefix(lang)}${src || "/" + key}`;
}

export function pageContent(key: PageKey, lang: Lang) {
  const src = PAGE_SOURCE[key];
  const rp = src ? pages[src] : undefined;
  if (!rp) return null;
  const o = rp.langs[lang];
  const pick = o && o.html.length > 200 ? o : rp.langs.en || o;
  if (!pick) return null;
  return { title: o?.title || pick.title, html: pick.html.replace(/https?:\/\/(www\.)?tickets2000\.com/g, "") };
}

// ------------------------------------------------------------- catalog + routing
export type Route =
  | { kind: "home" }
  | { kind: "category"; category: Category }
  | { kind: "product"; product: Product; category: Category }
  | { kind: "page"; page: PageKey };

export type Catalog = {
  products: Product[]; // active, sorted
  get: (id: number) => Product | undefined;
  /** what is booked: the base tickets of a combo, or the product itself */
  parts: (p: Product) => Product[];
  inCategory: (c: Category) => Product[];
  resolve: (lang: Lang, segments?: string[]) => Route | undefined;
  segments: (lang: Lang) => string[][];
};

function stripPrefix(path: string, lang: Lang) {
  const pre = localePrefix(lang);
  return pre && path.startsWith(pre) ? path.slice(pre.length) || "/" : path;
}

export function buildCatalog(all: Product[]): Catalog {
  const products = all.filter((p) => p.active).sort((a, b) => a.sort - b.sort || a.id - b.id);
  const byId = new Map(products.map((p) => [p.id, p]));
  const anyById = new Map(all.map((p) => [p.id, p])); // base tickets of a combo may be hidden themselves
  const routes = new Map<Lang, Map<string, Route>>();

  const build = (lang: Lang) => {
    const map = new Map<string, Route>();
    map.set("", { kind: "home" });
    for (const c of CATEGORIES) map.set(c.slugs[lang], { kind: "category", category: c });
    for (const p of products) {
      const slug = productSlug(p, lang);
      const primary = primaryCategory(p);
      const cats = CATEGORIES.filter((c) => p.categories.includes(c.id));
      for (const c of new Set([primary, ...cats])) map.set(`${c.slugs[lang]}/${slug}`, { kind: "product", product: p, category: c });
      // every archived URL of the product keeps working
      for (const h of p.legacyUrls[lang] || []) {
        const rel = stripPrefix(h, lang).replace(/^\//, "");
        if (rel && !map.has(rel)) {
          const c = CATEGORIES.find((x) => x.slugs[lang] === rel.split("/")[0]) || primary;
          map.set(rel, { kind: "product", product: p, category: c });
        }
      }
    }
    for (const key of Object.keys(EXTRA_PATHS) as PageKey[]) {
      const rel = stripPrefix(pageUrl(key, lang), lang).replace(/^\//, "");
      if (rel) map.set(rel, { kind: "page", page: key });
    }
    return map;
  };
  const table = (lang: Lang) => {
    if (!routes.has(lang)) routes.set(lang, build(lang));
    return routes.get(lang)!;
  };

  return {
    products,
    get: (id) => byId.get(id),
    parts: (p) => {
      const list = p.components.map((id) => anyById.get(id)).filter((x): x is Product => !!x && x.id !== p.id);
      return list.length ? list : [p];
    },
    inCategory: (c) => products.filter((p) => p.categories.includes(c.id)),
    resolve: (lang, segments = []) => table(lang).get(segments.map(decodeURIComponent).join("/")),
    segments: (lang) => [...table(lang).keys()].map((k) => (k ? k.split("/") : [])),
  };
}

/** Language switcher targets for the current route */
export function alternates(route: Route): Record<Lang, string> {
  const out = {} as Record<Lang, string>;
  for (const l of LANGS) {
    if (route.kind === "home") out[l] = localePrefix(l) || "/";
    else if (route.kind === "category") out[l] = categoryUrl(route.category, l);
    else if (route.kind === "product") out[l] = productUrl(route.product, l, route.category);
    else out[l] = pageUrl(route.page, l);
  }
  return out;
}
