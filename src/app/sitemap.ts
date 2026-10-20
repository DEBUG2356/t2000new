import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/shop";
import { categoryUrl, pageUrl, productUrl } from "@/lib/catalog";
import { getCatalog } from "@/lib/server/catalog";
import { LANGS, localePrefix, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const urls: string[] = [];
  for (const l of LANGS) {
    urls.push(localePrefix(l) || "/");
    for (const c of CATEGORIES) urls.push(categoryUrl(c, l));
    for (const p of catalog.products) urls.push(productUrl(p, l));
    for (const k of ["partner", "contact", "privacy", "terms", "refund", "sitemap"] as const) urls.push(pageUrl(k, l));
  }
  return [...new Set(urls)].map((u) => ({ url: site.url + (u === "/" ? "" : u) }));
}
