// Downloads every HTML capture listed in a CDX text file (original timestamp status mime) into <outDir>/raw.
// Usage: node scripts/scrape-list.mjs <cdx.txt> <outDir>
import fs from "node:fs";
import path from "node:path";
const [list, outDir] = process.argv.slice(2).map((p) => path.resolve(p));
fs.mkdirSync(path.join(outDir, "raw"), { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lines = fs.readFileSync(list, "utf8").split("\n").map((l) => l.trim().split(" ")).filter((x) => x[0]?.startsWith("http"));
let n = 0;
for (const [orig, ts] of lines) {
  const file = path.join(outDir, "raw", orig.replace(/^https?:\/\/(www\.)?/, "").replace(/[^a-z0-9.-]+/gi, "~") + ".html");
  if (fs.existsSync(file)) continue;
  for (let i = 0; i < 6; i++) {
    try {
      const r = await fetch(`https://web.archive.org/web/${ts}id_/${orig}`);
      const t = await r.text();
      if (r.status === 429 || r.status >= 500 || t.includes("Temporarily Offline")) { await sleep(5000 * (i + 1)); continue; }
      if (r.ok) fs.writeFileSync(file, t);
      break;
    } catch { await sleep(4000); }
  }
  if (++n % 10 === 0) console.log(n, "/", lines.length);
  await sleep(700);
}
console.log("done", fs.readdirSync(path.join(outDir, "raw")).length, "files");
