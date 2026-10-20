// Translates the missing product texts of every product from English (Gemini) and stores them in Supabase.
// Existing translations and slugs are kept. Usage: npx tsx scripts/translate.mts [productId ...]
import fs from "node:fs";
import { LANGS } from "../src/lib/site";
import { translateProduct } from "../src/lib/translate-core";
import type { Product } from "../src/lib/types";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const url = env.SUPABASE_URL;
const key = env.SUPABASE_SECRET_KEY;
const ai = env.GEMINI_API_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
const only = process.argv.slice(2).map(Number).filter(Boolean);

const rows: { id: number; i18n: Product["i18n"] }[] = await (await fetch(`${url}/rest/v1/products?select=id,i18n&order=sort.asc`, { headers })).json();
const todo = rows.filter((r) => !only.length || only.includes(r.id));
console.log(`${todo.length} products`);

let i = 0;
const worker = async () => {
  while (i < todo.length) {
    const r = todo[i++];
    const t0 = Date.now();
    const res = await translateProduct({ id: r.id, i18n: r.i18n } as Product, [...LANGS], ai);
    if (res.done.length) {
      const up = await fetch(`${url}/rest/v1/products?id=eq.${r.id}`, {
        method: "PATCH",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ i18n: res.i18n, updated_at: new Date().toISOString() }),
      });
      if (!up.ok) console.log(`#${r.id} save failed`, up.status, await up.text());
    }
    console.log(`#${r.id} ${res.done.join(",") || "–"} ${res.failed.length ? "FAILED " + res.failed.join(" | ") : ""} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
};
await Promise.all([worker(), worker(), worker()]);
console.log("done");
