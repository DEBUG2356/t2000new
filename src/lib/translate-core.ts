// AI translation of product texts (Gemini). Shared by the admin "Fordítás" button and scripts/translate.mts.
import type { Lang } from "./site";
import type { LangText, Product } from "./types";

const LANG_NAME: Record<Lang, string> = { en: "English", fr: "French", es: "Spanish", de: "German", sk: "Slovak", it: "Italian" };
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.6-flash"];

// translatable fields (slug is generated, never translated by the model)
const STRING_FIELDS = ["title", "cardTitle", "location", "metaDescription", "overview", "info", "additional", "address", "cancellation"] as const;
const LIST_FIELDS = ["package", "included"] as const;

type Source = Partial<Record<(typeof STRING_FIELDS)[number], string>> & Partial<Record<(typeof LIST_FIELDS)[number], string[]>> & { labels?: string[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

/** Fields of `en` that are missing (or still identical to English) in `target` */
export function missingFields(en: LangText, target: LangText | undefined, force = false): Source {
  const out: Source = {};
  // identical to English only counts as "untranslated" for longer texts – short names like "Paris" or "Louvre" are often the same
  const same = (a?: string, b?: string) => !!a && !!b && a.length > 40 && a.replace(/\s+/g, " ").trim() === b.replace(/\s+/g, " ").trim();
  for (const f of STRING_FIELDS) {
    const src = en[f];
    if (!src || !String(src).trim()) continue;
    const cur = target?.[f];
    // addresses and place names are often identical in every language – only fill them when empty
    const nameLike = f === "address" || f === "location";
    if (force || !cur || !String(cur).trim() || (!nameLike && same(src, cur))) out[f] = src;
  }
  for (const f of LIST_FIELDS) {
    const src = en[f];
    if (!src?.length) continue;
    const cur = target?.[f];
    if (force || !cur?.length || (src.join("|").length > 40 && src.join("|") === cur.join("|"))) out[f] = src;
  }
  const enLabels = (en.labels || []).map((l) => l.text);
  const curLabels = (target?.labels || []).map((l) => l.text);
  if (enLabels.length && (force || !curLabels.length)) out.labels = enLabels;
  return out;
}

async function callGemini(prompt: string, key: string): Promise<string> {
  let last = "";
  for (let attempt = 0; attempt < MODELS.length * 2; attempt++) {
    const model = MODELS[attempt % MODELS.length];
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.2, thinkingConfig: { thinkingLevel: "low" } },
        }),
        signal: AbortSignal.timeout(60_000),
      });
      if (!res.ok) {
        last = `${model} ${res.status}: ${(await res.text()).slice(0, 200)}`;
        if (process.env.TRANSLATE_DEBUG) console.log("  ", last);
        await sleep(1500 * (attempt + 1));
        continue;
      }
      const j = await res.json();
      const cand = j.candidates?.[0];
      const text = (cand?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("");
      if (cand?.finishReason && cand.finishReason !== "STOP") {
        last = `${model} finishReason ${cand.finishReason}`;
        continue;
      }
      if (text) return text;
      last = `${model}: empty answer`;
    } catch (e) {
      last = `${model}: ${(e as Error).message}`;
      await sleep(1500);
    }
  }
  throw new Error(`Translation failed (${last})`);
}

/** Translates the given English fields into `lang` and returns them merged into `target` */
export async function translateFields(src: Source, lang: Lang, key: string): Promise<Source> {
  if (!Object.keys(src).length) return {};
  const prompt = `You translate texts of a tourist attraction ticket shop (tickets2000.com) from English to ${LANG_NAME[lang]}.
Rules:
- Return ONLY a JSON object with exactly the same keys and the same structure (strings stay strings, arrays stay arrays of the same length).
- Keep every HTML tag, attribute and entity exactly as it is; translate only the visible text between the tags.
- Keep proper names of monuments, museums, companies and brands as they are commonly written in ${LANG_NAME[lang]} (e.g. Louvre, Eiffel Tower → official ${LANG_NAME[lang]} name).
- Keep prices, times, dates, e-mail addresses, URLs and numbers unchanged.
- "location" and "address" are place names: translate country/region words only.
- "labels" are short badges on a product card (e.g. "Highly Recommended", "Free Cancellation", "Skip-the-line").
- Natural, fluent marketing language for travellers; no explanations, no markdown.

JSON to translate:
${JSON.stringify(src)}`;
  // the model very rarely answers with invalid JSON – ask again then
  let parsed: Source | null = null;
  for (let i = 0; i < 3 && !parsed; i++) {
    const raw = await callGemini(prompt, key);
    try {
      parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")) as Source;
    } catch {
      if (i === 2) throw new Error("invalid JSON from the model");
    }
  }
  if (!parsed) return {};
  const out: Source = {};
  for (const k of Object.keys(src) as (keyof Source)[]) {
    const v = parsed[k];
    if (Array.isArray(src[k])) {
      if (Array.isArray(v) && v.length === (src[k] as string[]).length) (out as Record<string, unknown>)[k] = v.map(String);
    } else if (typeof v === "string" && v.trim()) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

/**
 * Fills the missing texts of the given languages from English. Existing slugs are never changed
 * (they are the live URLs); a missing slug is generated from the translated title.
 */
export async function translateProduct(p: Product, langs: Lang[], key: string, force = false): Promise<{ i18n: Product["i18n"]; done: Lang[]; failed: string[] }> {
  const en = p.i18n.en;
  const i18n = structuredClone(p.i18n);
  const done: Lang[] = [];
  const failed: string[] = [];
  if (!en?.title) return { i18n, done, failed: ["Nincs angol szöveg."] };
  for (const lang of langs) {
    if (lang === "en") continue;
    const target = i18n[lang];
    const src = missingFields(en, target, force);
    if (!Object.keys(src).length) continue;
    try {
      const tr = await translateFields(src, lang, key);
      const next: LangText = { ...(target || { title: "", slug: "" }) };
      for (const f of STRING_FIELDS) if (tr[f]) next[f] = tr[f];
      for (const f of LIST_FIELDS) if (tr[f]) next[f] = tr[f];
      if (tr.labels) next.labels = (en.labels || []).map((l, i) => ({ text: tr.labels![i] || l.text, bg: target?.labels?.[i]?.bg || l.bg }));
      if (!next.title) next.title = en.title;
      if (!next.slug) next.slug = slugify(next.title) || en.slug;
      i18n[lang] = next;
      done.push(lang);
    } catch (e) {
      failed.push(`${lang}: ${(e as Error).message}`);
    }
  }
  return { i18n, done, failed };
}
