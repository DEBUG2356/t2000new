import "server-only";
import { cache } from "react";
import { buildCatalog } from "@/lib/catalog";
import { buildSeedProducts } from "@/lib/seed";
import { dbConfigured, fetchProducts } from "./db";

/** Product catalog for the public site: Supabase (cached) → built-in seed data as a fallback. */
export const getCatalog = cache(async () => {
  if (dbConfigured()) {
    try {
      const products = await fetchProducts();
      if (products.length) return buildCatalog(products);
    } catch (e) {
      console.error("[catalog] Supabase unavailable, using seed data", e);
    }
  }
  return buildCatalog(buildSeedProducts());
});
