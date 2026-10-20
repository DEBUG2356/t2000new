import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
const dir = path.resolve(process.argv[2]);
const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
const clean = (u) => (u || "").replace(/^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\//, "");
const cards = {};
for (const [key, v] of Object.entries(index)) {
  if (v.status !== 200) continue;
  const $ = cheerio.load(fs.readFileSync(path.join(dir, "raw", v.file), "utf8"));
  const lang = $("html").attr("lang");
  $(".product-item").each((_, el) => {
    const c = $(el);
    const pid = c.find('input[name="product_id"]').attr("value");
    const href = clean(c.find("a.product-link, a.product-details").first().attr("href")).replace("https://tickets2000.com", "");
    const img = clean(c.find("[data-bg]").attr("data-bg"));
    const price = c.find(".price-wrap").text().replace(/\s+/g, " ").trim();
    const rec = {
      pid, lang, href, title: c.find(".product-name").text().trim(), img,
      reviews: c.find(".reviews").text().trim(), location: c.find(".location span").text().trim(),
      rating: c.find(".rating span").text().trim(), price, labels: c.find(".product-labels").text().replace(/\s+/g, " ").trim(), ts: v.ts, from: key,
    };
    const k = pid + ":" + lang;
    (cards[k] ||= []).push(rec);
  });
}
fs.writeFileSync(path.join(dir, "cards.json"), JSON.stringify(cards, null, 1));
const byPid = {};
for (const [k, list] of Object.entries(cards)) {
  const [pid, lang] = k.split(":");
  const latest = list.sort((a, b) => (a.ts < b.ts ? 1 : -1))[0];
  (byPid[pid] ||= {})[lang] = latest;
}
for (const [pid, langs] of Object.entries(byPid)) {
  const en = langs.en || Object.values(langs)[0];
  console.log(pid.padStart(4), Object.keys(langs).join(","), "|", en.title, "|", en.location, "|", en.rating, en.reviews, "|", en.price, "|", en.href, "|", en.img.split("/").pop());
}
