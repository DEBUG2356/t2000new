import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
const dir = path.resolve(process.argv[2]);
const out = path.join(dir, "text");
fs.mkdirSync(out, { recursive: true });
const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
for (const [key, v] of Object.entries(index)) {
  if (v.status !== 200 || key.includes("?page=")) continue;
  const $ = cheerio.load(fs.readFileSync(path.join(dir, "raw", v.file), "utf8"));
  $("script,style,svg,noscript,.module-languages,.product-item .properties-wrap,.modal,form .d-none").remove();
  $("br").replaceWith("\n");
  $("p,div,li,h1,h2,h3,h4,h5,tr").each((_, e) => { $(e).append("\n"); });
  const t = $("body").text().replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  fs.writeFileSync(path.join(out, v.file.replace(".html", ".txt")), key + "\n\n" + t);
}
