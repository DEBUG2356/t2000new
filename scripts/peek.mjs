import fs from "node:fs";
import * as cheerio from "cheerio";
const $ = cheerio.load(fs.readFileSync(process.argv[2], "utf8"));
$("script,style,svg,header,footer,noscript,.module-languages,.product-item,.modal").remove();
const main = $("main").length ? $("main") : $("body");
// print block-level structure with classes
function walk(el, d) {
  for (const c of $(el).children().toArray()) {
    const t = $(c).clone().children().remove().end().text().replace(/\s+/g, " ").trim();
    const cls = ($(c).attr("class") || "").split(" ").slice(0, 3).join(".");
    if (d < (+process.argv[3] || 7)) console.log("  ".repeat(d) + c.tagName + (cls ? "." + cls : "") + (t ? " » " + t.slice(0, 140) : ""));
    walk(c, d + 1);
  }
}
walk(main, 0);
