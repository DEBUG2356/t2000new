// Wayback Machine scraper for tickets2000.com
// Usage: node scripts/scrape.mjs <outDir>
// Downloads the newest archived capture of every HTML page (raw, id_ mode),
// follows internal links found in pages, and records everything in index.json.
import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(process.argv[2] || "_archive");
const RAW = path.join(OUT, "raw");
fs.mkdirSync(RAW, { recursive: true });
const INDEX = path.join(OUT, "index.json");
const index = fs.existsSync(INDEX) ? JSON.parse(fs.readFileSync(INDEX, "utf8")) : {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "Mozilla/5.0 (archive restore for site owner)" };

async function get(url, tries = 8) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, redirect: "follow" });
      const buf = Buffer.from(await res.arrayBuffer());
      const txt = buf.toString("utf8");
      if (res.status === 429 || res.status >= 500 || txt.includes("Temporarily Offline")) {
        const wait = 5000 * (i + 1);
        console.log(`  ${res.status} retry in ${wait / 1000}s: ${url}`);
        await sleep(wait);
        continue;
      }
      return { status: res.status, url: res.url, buf, txt };
    } catch (e) {
      const wait = 4000 * (i + 1);
      console.log(`  ERR ${e.message} retry in ${wait / 1000}s`);
      await sleep(wait);
    }
  }
  return null;
}

// Normalise an original URL to a key: path + (only meaningful query)
function keyOf(u) {
  try {
    const x = new URL(u, "https://tickets2000.com/");
    if (!/tickets2000\.com$/.test(x.hostname)) return null;
    let p = x.pathname.replace(/\/+$/, "") || "/";
    if (/\.(css|js|webp|png|jpe?g|gif|svg|ico|ttf|woff2?|pdf)$/i.test(p)) return null;
    if (p.startsWith("/storage") || p.startsWith("/assets") || p.startsWith("/checkout") || p.startsWith("/cart")) return null;
    const q = x.searchParams;
    let qs = "";
    if (q.has("page")) qs = `?page=${q.get("page")}`;
    else if (q.has("check-availability")) qs = "?check-availability";
    return p + qs;
  } catch {
    return null;
  }
}

function fileOf(key) {
  return path.join(RAW, (key === "/" ? "_home" : key.slice(1)).replace(/[?=]/g, "__").replace(/\//g, "~") + ".html");
}

async function cdxList() {
  const cache = path.join(OUT, "cdx.txt");
  if (fs.existsSync(cache) && fs.statSync(cache).size > 1000) return fs.readFileSync(cache, "utf8");
  const r = await get("https://web.archive.org/cdx/search/cdx?url=tickets2000.com/*&fl=original,timestamp,statuscode,mimetype&filter=statuscode:200", 15);
  if (!r) throw new Error("CDX unavailable");
  fs.writeFileSync(cache, r.txt);
  return r.txt;
}

const queue = new Map(); // key -> timestamp hint
const origOf = new Map(); // key -> original URL as captured
const txt = await cdxList();
for (const line of txt.split("\n")) {
  const [orig, ts, , mime] = line.trim().split(" ");
  if (!orig || mime !== "text/html") continue;
  const k = keyOf(orig);
  if (!k) continue;
  // keep newest capture
  if (!queue.has(k) || queue.get(k) < ts) {
    queue.set(k, ts);
    origOf.set(k, orig);
  }
}
// make sure the review pages / base pages exist even if only query variants were captured
for (const k of [...queue.keys()]) {
  const base = k.split("?")[0];
  if (!queue.has(base)) queue.set(base, "2026");
}
console.log(`CDX: ${queue.size} page keys`);

// retry earlier 404s that may have failed only because of a reconstructed URL
for (const [k, v] of Object.entries(index)) {
  if (v.status === 404 && !v.retried && (origOf.has(k) || k.includes("check-availability"))) delete index[k];
}
const done = new Set(Object.keys(index));
const pending = [...queue.keys()].filter((k) => !done.has(k));

async function fetchKey(k) {
  const ts = queue.get(k) || "2026";
  const orig = origOf.get(k) || "https://tickets2000.com" + k;
  let r = await get(`https://web.archive.org/web/${ts}id_/${orig}`);
  if (r && r.status === 404 && k.endsWith("?check-availability")) {
    r = await get(`https://web.archive.org/web/${ts}id_/https://tickets2000.com${k}=`);
  }
  if (r && r.status === 404) {
    // any capture of the same URL (exact timestamp may be a non-200 capture)
    r = await get(`https://web.archive.org/web/2026id_/${orig}`);
  }
  if (!r || r.status !== 200) {
    index[k] = { status: r ? r.status : "fail", ts, retried: true };
    return;
  }
  const f = fileOf(k);
  fs.writeFileSync(f, r.buf);
  const m = r.url.match(/\/web\/(\d+)id_\//);
  index[k] = { status: 200, ts: m ? m[1] : ts, file: path.basename(f) };
  // discover new links
  for (const h of r.txt.matchAll(/href=["']([^"']+)["']/g)) {
    let href = h[1].replace(/^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\//, "");
    const nk = keyOf(href);
    // review pagination is only taken from the CDX list (link-following would walk hundreds of uncaptured pages)
    if (nk && !nk.includes("?page=") && !queue.has(nk)) {
      queue.set(nk, "2026");
      pending.push(nk);
    }
  }
}

let n = 0;
while (pending.length) {
  const batch = pending.splice(0, 3);
  await Promise.all(batch.map(fetchKey));
  n += batch.length;
  fs.writeFileSync(INDEX, JSON.stringify(index, null, 1));
  console.log(`${n} done, ${pending.length} left  (${batch.join(", ")})`);
  await sleep(1200);
}
const ok = Object.values(index).filter((v) => v.status === 200).length;
console.log(`FINISHED: ${ok}/${Object.keys(index).length} pages saved`);
