// Collect every /storage/ image referenced by scraped pages and try to fetch it from the Wayback Machine.
import fs from "node:fs";
import path from "node:path";
const dir = path.resolve(process.argv[2]);
const outDir = path.join(dir, "img");
fs.mkdirSync(outDir, { recursive: true });
const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
const urls = new Set();
for (const v of Object.values(index)) {
  if (v.status !== 200) continue;
  const html = fs.readFileSync(path.join(dir, "raw", v.file), "utf8");
  for (const m of html.matchAll(/https?:\/\/tickets2000\.com\/(storage\/[^"'\s)]+?\.(?:webp|jpe?g|png|gif|svg))/gi)) urls.add(m[1].replace(/\/\.\//g, "/").replace(/\/\/+/g, "/"));
  for (const m of html.matchAll(/https?:\/\/tickets2000\.com\/((?:images|assets\/front\/images)\/[^"'\s)]+?\.(?:webp|jpe?g|png|gif|svg|ico))/gi)) urls.add(m[1]);
}
const resPath = path.join(dir, "img-index.json");
const res = fs.existsSync(resPath) ? JSON.parse(fs.readFileSync(resPath, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function tryGet(u) {
  for (let i = 0; i < 6; i++) {
    try {
      const r = await fetch(u, { redirect: "follow" });
      if (r.status === 429 || r.status >= 500) { await sleep(4000 * (i + 1)); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      const ct = r.headers.get("content-type") || "";
      return { status: r.status, buf, ct };
    } catch { await sleep(3000 * (i + 1)); }
  }
  return null;
}
const list = [...urls].filter((u) => !res[u]);
console.log(urls.size, "image urls,", list.length, "to fetch");
let n = 0;
async function one(u) {
  // try the exact path, then the "./" variant used by the CMS
  const variants = [u, u.replace(/^storage\/(list|thumb)\//, "storage/./$1/")];
  for (const v of variants) {
    const r = await tryGet(`https://web.archive.org/web/2026im_/https://tickets2000.com/${v}`);
    if (r && r.status === 200 && /image|octet/.test(r.ct) && r.buf.length > 200) {
      const f = path.join(outDir, u.replace(/\//g, "~"));
      fs.writeFileSync(f, r.buf);
      res[u] = { ok: true, size: r.buf.length };
      return;
    }
  }
  res[u] = { ok: false };
}
while (list.length) {
  const batch = list.splice(0, 4);
  await Promise.all(batch.map(one));
  n += batch.length;
  fs.writeFileSync(resPath, JSON.stringify(res, null, 1));
  if (n % 20 === 0) console.log(n, "done");
  await sleep(800);
}
const ok = Object.values(res).filter((r) => r.ok).length;
console.log(`FINISHED ${ok}/${Object.keys(res).length} images`);
