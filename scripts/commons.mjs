// Fetches replacement photos from Wikimedia Commons for products/categories whose original
// images are not in the Wayback Machine. Writes public/media/<key>-<n>.webp and src/data/credits.json.
// Usage: node scripts/commons.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const OUT = path.resolve("public/media");
const CREDITS = path.resolve("src/data/credits.json");
fs.mkdirSync(OUT, { recursive: true });
const credits = fs.existsSync(CREDITS) ? JSON.parse(fs.readFileSync(CREDITS, "utf8")) : {};
const UA = { "User-Agent": "Tickets2000SiteRestore/1.0 (simdev22@gmail.com)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// key -> [search query, how many]
const JOBS = {
  "p1": ["Bateaux Parisiens Seine boat Eiffel", 4],
  "p7": ["Seine dinner cruise boat night Paris", 4],
  "p12": ["Panthéon Paris", 4],
  "p14": ["Abbaye du Mont-Saint-Michel", 4],
  "p27": ["Sainte-Chapelle upper chapel stained glass", 4],
  "p28": ["Arc de Triomphe Paris", 4],
  "p29": ["Conciergerie Paris", 4],
  "p30": ["Cité de Carcassonne remparts", 4],
  "p35": ["Louvre Pyramid", 4],
  "p36": ["Eiffel Tower second floor view", 4],
  "p47": ["Panthéon Paris interior", 3],
  "p48": ["Conciergerie Salle des Gens d'armes", 3],
  "p50": ["Bateau-mouche Tour Eiffel", 3],
  "p75": ["Loro Parque Tenerife", 4],
  "p76": ["Siam Park Tenerife", 4],
  "p77": ["Loro Parque orca", 3],
  "p87": ["Sagrada Família Barcelona", 4],
  "p88": ["Park Güell Barcelona", 4],
  "p89": ["Park Güell mosaic", 3],
  "p100": ["Louvre Museum audioguide gallery", 3],
  "p135": ["Musée du Louvre Cour Napoléon", 4],
  "p136": ["Tour Eiffel deuxième étage", 3],
  "p137": ["Seine river cruise Paris boat", 4],
  "p138": ["Louvre Eiffel Seine", 3],
  "p139": ["Louvre Grande Galerie", 3],
  "p140": ["Eiffel Tower from Seine river boat", 3],
  "p141": ["Louvre Museum Pyramid night", 3],
  "p142": ["Pont des Arts Seine Louvre", 3],
  "p145": ["Spiš Castle", 4],
  "p146": ["Husky dog sledding", 4],
  "p147": ["Brown bear Slovakia Tatra", 4],
  "p148": ["Museo Reina Sofía Madrid", 4],
  "p149": ["Guggenheim Museum Bilbao", 4],
  "p150": ["Palacio Real de Madrid", 4],
  "cat-paris": ["Paris skyline Eiffel Tower panorama", 1],
  "cat-barcelona": ["Barcelona skyline panorama", 1],
  "cat-tenerifa": ["Tenerife coast Teide", 1],
  "cat-slovakia": ["High Tatras Slovakia panorama", 1],
  "cat-madrid": ["Madrid Gran Vía panorama", 1],
  "cat-top-offers": ["Paris Louvre panorama", 1],
  "cat-boat-tours": ["Seine Paris boat panorama", 1],
  "cat-near-to-paris": ["Mont-Saint-Michel panorama", 1],
  "cat-eiffel-tower": ["Eiffel Tower Champ de Mars panorama", 1],
  "cat-louvre": ["Louvre Museum courtyard panorama", 1],
};

const OK_LICENSE = /^(cc0|public domain|pd|cc by(-sa)? [1-4]\.0|cc by(-sa)? 2\.5|cc-by(-sa)?-[1-4]\.0)/i;
async function api(params) {
  const u = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({ format: "json", origin: "*", ...params });
  for (let i = 0; i < 5; i++) {
    const r = await fetch(u, { headers: UA });
    if (r.ok) return r.json();
    await sleep(3000 * (i + 1));
  }
  throw new Error("commons api failed");
}
const strip = (h) => (h || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

// CLI: node scripts/commons.mjs <key> "<query>" <count>  -> adds more images to one key
const cli = process.argv[2] ? { [process.argv[2]]: [process.argv[3], +(process.argv[4] || 3)] } : null;
const EXCLUDED = new Set(fs.existsSync(path.resolve("scripts/commons-excluded.txt")) ? fs.readFileSync(path.resolve("scripts/commons-excluded.txt"), "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean) : []);

for (const [key, [query, count]] of Object.entries(cli || JOBS)) {
  const have = credits[key] || [];
  if (!cli && have.length >= count) continue;
  const target = cli ? have.length + count : count;
  const j = await api({
    action: "query", generator: "search", gsrsearch: `${query} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "30",
    prop: "imageinfo", iiprop: "url|extmetadata|size|mime", iiurlwidth: key.startsWith("cat-") ? "1920" : "1280",
  });
  const pagesArr = Object.values(j.query?.pages || {}).sort((a, b) => a.index - b.index);
  const picked = [...have];
  for (const pg of pagesArr) {
    const ii = pg.imageinfo?.[0];
    if (!ii || !/jpeg|png|webp/.test(ii.mime)) continue;
    const md = ii.extmetadata || {};
    const lic = strip(md.LicenseShortName?.value);
    if (!OK_LICENSE.test(lic)) continue;
    if (EXCLUDED.has(pg.title.replace(/^File:/, "")) || picked.some((x) => x.source === ii.descriptionurl)) continue;
    const minW = key.startsWith("cat-") ? 1600 : 1000;
    if (ii.width < minW || ii.width < ii.height) continue; // landscape only
    try {
      const r = await fetch(ii.thumburl, { headers: UA });
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      let n = picked.length + 1;
      while (fs.existsSync(path.join(OUT, `${key}-${n}.webp`))) n++;
      const file = `${key}-${n}.webp`;
      await sharp(buf).resize({ width: key.startsWith("cat-") ? 1920 : 1280, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(OUT, file));
      picked.push({ file: `/media/${file}`, title: pg.title.replace(/^File:/, ""), author: strip(md.Artist?.value) || "Unknown", license: lic, licenseUrl: md.LicenseUrl?.value || "", source: ii.descriptionurl });
    } catch (e) { console.log("  skip", e.message); }
    if (picked.length >= target) break;
    await sleep(300);
  }
  credits[key] = picked;
  fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 1));
  console.log(key, picked.length + "/" + target, picked.map((p) => p.title).join(" | ").slice(0, 200));
  await sleep(500);
}
