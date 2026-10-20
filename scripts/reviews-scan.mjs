// Collects review texts (stars, date, text) per product id from a folder of archived product pages.
// Usage: node scripts/reviews-scan.mjs <rawDir> [<rawDir> ...]  -> prints JSON {productId: {title, reviews}}
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
const out = {};
for (const dir of process.argv.slice(2)) {
  for (const f of fs.readdirSync(dir)) {
    const html = fs.readFileSync(path.join(dir, f), "utf8");
    const pid = (html.match(/setProductId\((\d+)\)/) || [])[1];
    if (!pid) continue;
    const $ = cheerio.load(html);
    const rec = (out[pid] ||= { title: $("h1.product-name").first().text().trim(), total: $(".ratings .total").next().text().trim(), reviews: [] });
    $(".comments .comment-item").each((_, c) => {
      const stars = $(c).find(".title .icon-star-full").length + 0.5 * $(c).find(".title .icon-star-half").length;
      const date = $(c).find(".title > span").last().text().trim();
      const text = $(c).find(".comment").text().replace(/\s+/g, " ").trim();
      if (text && !rec.reviews.some((r) => r.text === text)) rec.reviews.push({ stars, date, text });
    });
  }
}
fs.writeFileSync("_archive/reviews-found.json", JSON.stringify(out, null, 1));
for (const [id, r] of Object.entries(out)) console.log(id.padStart(4), String(r.reviews.length).padStart(3), "|", r.title, "|", r.total);
