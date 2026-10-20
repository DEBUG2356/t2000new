import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
const dir = path.resolve(process.argv[2]);
const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
const out = [];
for (const [key, v] of Object.entries(index)) {
  if (v.status !== 200) continue;
  const html = fs.readFileSync(path.join(dir, "raw", v.file), "utf8");
  const $ = cheerio.load(html);
  const body = $("body").attr("class") || "";
  const type = (body.match(/(product|products|home|search|contact)-page/) || [, "page"])[1];
  const lang = $("html").attr("lang");
  const pid = (html.match(/setProductId\((\d+)\)/) || [])[1];
  const title = $("title").text().trim();
  const langLinks = {};
  $(".module-languages a[href]").each((_, a) => {
    const h = $(a).attr("href").replace(/^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\//, "");
    const m = h.match(/^https?:\/\/tickets2000\.com(\/(fr|de|es|it|sk))?(\/[^?]*)?/);
    if (m) langLinks[m[2] || "en"] = (m[1] || "") + (m[3] || "") || "/";
  });
  out.push({ key, ts: v.ts, lang, type, pid, title, langLinks });
}
fs.writeFileSync(path.join(dir, "survey.json"), JSON.stringify(out, null, 1));
const prods = {};
for (const p of out.filter((p) => p.type === "product")) (prods[p.pid] ||= new Set()).add(p.lang + ":" + p.title);
for (const [id, s] of Object.entries(prods)) console.log(id, [...s].join(" | "));
console.log("--- non-product");
for (const p of out.filter((p) => p.type !== "product" && !p.key.includes("?"))) console.log(p.type, p.lang, p.key, "|", p.title);
