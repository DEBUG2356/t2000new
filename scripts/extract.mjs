// Builds src/data/catalog.json from the scraped Wayback pages.
// Usage: node scripts/extract.mjs _archive
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const dir = path.resolve(process.argv[2] || "_archive");
const OUT = path.resolve("src/data/catalog.json");
const LANGS = ["en", "fr", "es", "de", "sk", "it"];
const index = JSON.parse(fs.readFileSync(path.join(dir, "index.json"), "utf8"));
const imgIndex = fs.existsSync(path.join(dir, "img-index.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "img-index.json"), "utf8")) : {};

const unwb = (u) => (u || "").replace(/^https?:\/\/web\.archive\.org\/web\/\d+[a-z_]*\//, "");
const sitePath = (u) => {
  const m = unwb(u).match(/^https?:\/\/(?:www\.)?tickets2000\.com(\/[^?#]*)?/);
  if (!m) return null;
  return (m[1] || "/").replace(/\/+$/, "") || "/";
};
const langOfPath = (p) => (p.match(/^\/(fr|es|de|sk|it)(\/|$)/) || [, "en"])[1];
const stripLang = (p) => p.replace(/^\/(fr|es|de|sk|it)(?=\/|$)/, "") || "/";
// storage path -> local public path (only if downloaded), else null
const normStorage = (u) => {
  const m = unwb(u).match(/tickets2000\.com\/(storage\/[^"'\s)]+)/);
  return m ? m[1].replace(/\/\.\//g, "/").replace(/\/\/+/g, "/") : null;
};
const localImg = (u) => {
  const s = normStorage(u);
  if (!s) return null;
  return imgIndex[s]?.ok ? "/" + s : null;
};
// best available variant for an image: full -> thumb -> list
const bestImg = (u) => {
  const s = normStorage(u);
  if (!s) return null;
  const file = s.split("/").pop();
  const base = file.replace(/_(576x576|991x991|450x450)(?=\.\w+$)/, "");
  const folder = s.replace(/\/[^/]+$/, "").replace(/\/(list|thumb)$/, "");
  const cands = [`${folder}/${base}`, `${folder}/thumb/${base.replace(/(\.\w+)$/, "_991x991$1")}`, `${folder}/list/${base.replace(/(\.\w+)$/, "_576x576$1")}`, s];
  for (const c of cands) if (imgIndex[c]?.ok) return "/" + c;
  return null;
};
const listImg = (u) => {
  const s = normStorage(u);
  if (!s) return null;
  const file = s.split("/").pop();
  const base = file.replace(/_(576x576|991x991|450x450)(?=\.\w+$)/, "");
  const folder = s.replace(/\/[^/]+$/, "").replace(/\/(list|thumb)$/, "");
  const cands = [`${folder}/list/${base.replace(/(\.\w+)$/, "_576x576$1")}`, `${folder}/thumb/${base.replace(/(\.\w+)$/, "_991x991$1")}`, `${folder}/${base}`, s];
  for (const c of cands) if (imgIndex[c]?.ok) return "/" + c;
  return null;
};

// Clean CMS html: drop inline styles/data attrs, unwrap meaningless spans
function cleanHtml($, el) {
  const c = $(el).clone();
  c.find("script,style,svg").remove();
  c.find("*").each((_, e) => {
    for (const a of Object.keys(e.attribs || {})) if (!["href", "target", "rel", "colspan", "rowspan"].includes(a)) $(e).removeAttr(a);
    if (e.attribs?.href) $(e).attr("href", unwb(e.attribs.href));
  });
  // unwrap spans repeatedly
  for (let i = 0; i < 60; i++) {
    const spans = c.find("span");
    if (!spans.length) break;
    spans.each((_, s) => { $(s).replaceWith($(s).contents()); });
  }
  // drop editor junk: custom elements, empty wrappers, headings inside list items
  c.find("*").each((_, e) => { if (e.tagName && e.tagName.includes("-")) $(e).replaceWith($(e).contents()); });
  for (let i = 0; i < 10; i++) c.find("div").each((_, d) => { $(d).replaceWith($(d).contents()); });
  c.find("li h1, li h2, li h3, li h4, li h5, li h6").each((_, h) => { $(h).replaceWith($(h).contents()); });
  c.find("h1,h2,h3,h4,h5,h6,p,strong,b,em,i").each((_, e) => { if (!$(e).text().trim() && !$(e).find("img,br").length) $(e).remove(); });
  let h = c.html() || "";
  h = h.replace(/&nbsp;/g, " ").replace(/\s+\n/g, "\n").replace(/\n{2,}/g, "\n").replace(/<p>\s*<\/p>/g, "").trim();
  return h;
}

const pages = [];
for (const [key, v] of Object.entries(index)) {
  if (v.status !== 200) continue;
  const html = fs.readFileSync(path.join(dir, "raw", v.file), "utf8");
  const $ = cheerio.load(html);
  const body = $("body").attr("class") || "";
  const type = (body.match(/\b(product|products|home|search|contact)-page\b/) || [, "page"])[1];
  const lang = $("html").attr("lang") || langOfPath(key);
  const langLinks = {};
  $(".module-languages a[href]").each((_, a) => {
    const p = sitePath($(a).attr("href"));
    if (p) langLinks[langOfPath(p)] = p;
  });
  pages.push({ key, path: key.split("?")[0], q: key.includes("?") ? key.split("?")[1] : "", ts: v.ts, html, $, type, lang, langLinks });
}
pages.sort((a, b) => (a.ts < b.ts ? 1 : -1)); // newest first

// ---------- product cards (all pages) ----------
const cardInfo = {}; // pid -> { langs: {lang: {title, href, location}}, img, rating, reviews, price, oldPrice }
for (const pg of pages) {
  const { $ } = pg;
  $(".product-item").each((_, el) => {
    const c = $(el);
    const pid = c.find('input[name="product_id"]').attr("value");
    if (!pid) return;
    const href = sitePath(c.find("a.product-link, a.product-details").first().attr("href"));
    const rec = (cardInfo[pid] ||= { langs: {}, hrefs: {} });
    const L = pg.lang;
    if (!rec.langs[L]) rec.langs[L] = {
      title: c.find(".product-name").text().trim(),
      location: c.find(".location span").text().trim(),
      props: c.find(".properties-wrap .col-6 > span:not(.image-wrap)").map((_, e) => $(e).text().replace(/\s+/g, " ").trim()).get(),
      labels: c.find(".product-labels > div").map((_, e) => ({ text: $(e).text().replace(/\s+/g, " ").trim(), bg: ($(e).attr("style") || "").match(/background-color:\s*(#[0-9a-f]+)/i)?.[1] || "#537ce8" })).get().filter((l) => l.text),
    };
    if (href) (rec.hrefs[L] ||= new Set()).add(href);
    if (!rec.img) rec.img = listImg(c.find("[data-bg]").attr("data-bg"));
    const rv = c.find(".reviews").text().match(/\d+/);
    if (rv && !rec.reviews) rec.reviews = +rv[0];
    const rt = c.find(".rating span").text().trim();
    if (rt && !rec.rating) rec.rating = +rt;
    const prices = [...c.find(".price-wrap").text().matchAll(/€\s*([\d.,]+)/g)].map((m) => +m[1].replace(/\./g, "").replace(",", "."));
    // newest capture wins (pages sorted newest first), prefer English cards
    if (prices.length && (rec.priceLang === undefined || (L === "en" && rec.priceLang !== "en"))) {
      rec.priceLang = L;
      if (prices.length >= 2) { rec.oldPrice = prices[0]; rec.price = prices[1]; } else { rec.price = prices[0]; rec.oldPrice = null; }
    }
  });
}

// ---------- category slugs per language ----------
const categories = {}; // enSlug -> { slugs: {lang: slug}, i18n: {lang: {title, headerTitle}}, header, pids:Set }
function catKeyFromEn(enSlug) { return (categories[enSlug] ||= { slugs: { en: enSlug }, i18n: {}, pids: [] }); }
// from product pages' language links we learn category slug translations
for (const pg of pages) {
  const ll = pg.langLinks;
  if (!ll.en) continue;
  const enParts = stripLang(ll.en).split("/").filter(Boolean);
  if (pg.type === "products" || pg.type === "product") {
    const cat = catKeyFromEn(enParts[0]);
    for (const L of LANGS) if (ll[L]) {
      const parts = stripLang(ll[L]).split("/").filter(Boolean);
      if (parts[0] && !cat.slugs[L]) cat.slugs[L] = parts[0];
    }
  }
}
// category pages content
for (const pg of pages.filter((p) => p.type === "products" && !p.q)) {
  const { $ } = pg;
  const enSlug = stripLang(pg.langLinks.en || pg.path).split("/").filter(Boolean)[0];
  const cat = catKeyFromEn(enSlug);
  const slug = stripLang(pg.path).split("/").filter(Boolean)[0];
  cat.slugs[pg.lang] ||= slug;
  if (!cat.i18n[pg.lang]) {
    cat.i18n[pg.lang] = {
      title: $(".page-title h1").text().trim(),
      headerTitle: $(".category-header-title").text().trim(),
      metaTitle: $("title").text().trim(),
      metaDescription: $('meta[name="description"]').attr("content") || "",
      description: cleanHtml($, $(".category-description, .shop-category-description").first()) || "",
    };
  }
  if (!cat.header) {
    const img = $(".category-header img").attr("src") || $(".category-header source").attr("srcset");
    cat.header = bestImg(img);
    cat.headerRaw = normStorage(img);
  }
  if (!cat.pids.length) $(".product-list .product-item").each((_, el) => { const id = $(el).find('input[name="product_id"]').attr("value"); if (id) cat.pids.push(id); });
}
// card hrefs also teach category slugs
for (const [pid, rec] of Object.entries(cardInfo)) {
  for (const [L, set] of Object.entries(rec.hrefs)) for (const h of set) {
    const parts = stripLang(h).split("/").filter(Boolean);
    if (parts.length !== 2) continue;
    // find category by slug in that lang
    let cat = Object.values(categories).find((c) => c.slugs[L] === parts[0]);
    if (!cat && L === "en") cat = catKeyFromEn(parts[0]);
    if (cat && !cat.pids.includes(pid) && L === "en") cat.extraPids = [...(cat.extraPids || []), pid];
  }
}

// ---------- product detail pages ----------
const products = {};
function parseProduct(pg) {
  const { $, html } = pg;
  const pid = (html.match(/setProductId\((\d+)\)/) || [])[1];
  if (!pid) return;
  const p = (products[pid] ||= { id: pid, i18n: {}, reviews: [], gallery: [] });
  const L = pg.lang;
  // gallery (language independent)
  if (!p.gallery.length) {
    $(`#slideshow_thumbs_gallery_${pid} li a`).each((_, a) => {
      const img = bestImg($(a).attr("href")) || bestImg($(a).attr("data-image"));
      if (img && !p.gallery.includes(img)) p.gallery.push(img);
    });
  }
  // ratings (language independent)
  if (!p.bars) {
    const bars = [];
    $(".ratings .bars .row").each((_, r) => { const cols = $(r).find(".col"); bars.push(+$(cols[2]).text().trim()); });
    if (bars.length === 5) p.bars = bars; // 5..1 stars
    const tv = $(".ratings .total .value").text().trim();
    if (tv) p.ratingDetail = +tv;
  }
  // location
  if (!p.mapQuery) {
    const g = $('#locationCollapse a[href*="google.com/maps"]').attr("href");
    const m = g && unwb(g).match(/q=([-\d.]+)%2C([-\d.]+)/);
    if (m) { p.lat = +m[1]; p.lng = +m[2]; }
  }
  // reviews from any page (dedupe by text)
  $(".comments .comment-item").each((_, c) => {
    const stars = $(c).find(".title .icon-star-full").length + 0.5 * $(c).find(".title .icon-star-half").length;
    const date = $(c).find(".title > span").last().text().trim();
    const text = $(c).find(".comment").text().replace(/\s+/g, " ").trim();
    if (text && !p.reviews.some((r) => r.text === text)) p.reviews.push({ stars, date, text, lang: L });
  });
  if (p.i18n[L]) return; // newer capture already parsed for this language
  const sec = (sel) => { const e = $(sel).first(); return e.length ? cleanHtml($, e) : ""; };
  const pkg = [];
  $(".product-full .tag-h1").filter((_, e) => $(e).next("ul").length > 0).first().next("ul").find("li").each((_, li) => pkg.push($(li).text().trim()));
  const desc = $(".product-description").first().clone();
  desc.find(".tag-h1").first().remove();
  const included = [];
  $(".property-value ul.tick-list li").each((_, li) => included.push($(li).text().replace(/\s+/g, " ").trim()));
  const head = (sel) => $(sel).find(".tag-h1 span").first().text().trim();
  p.i18n[L] = {
    title: $("h1.product-name").first().text().trim(),
    metaTitle: $("title").text().replace(/^Tickets 2000 \| /, "").trim(),
    metaDescription: $('meta[name="description"]').attr("content") || "",
    package: pkg,
    overview: cleanHtml($, desc),
    included,
    info: sec("#informationsCollapse .pt-1"),
    additional: sec("#additionalInfoCollapse .pt-1"),
    address: $("#locationCollapse p").first().text().trim(),
    cancellation: sec("#cPolicyCollapse .pt-1"),
    headings: {
      overview: $(".product-description .tag-h1").first().text().trim(),
      package: $(".product-full .tag-h1").filter((_, e) => $(e).next("ul").length > 0).first().text().trim(),
      included: $(".property-value").first().prev(".tag-h1").text().trim(),
      info: head(".informations"),
      additional: $("#additionalInfoCollapse").parent().find(".tag-h1 span").first().text().trim(),
      location: $("#locationCollapse").parent().find(".tag-h1 span").first().text().trim(),
      cancellation: head(".cancellation-policy"),
    },
  };
}
for (const pg of pages.filter((p) => p.type === "product")) parseProduct(pg);

// ---------- static pages ----------
const staticPages = {}; // enPath -> {lang: {path, title, html}}
for (const pg of pages.filter((p) => (p.type === "page" || p.type === "contact" || p.type === "search") && !p.q)) {
  const { $ } = pg;
  const enPath = pg.langLinks.en || (pg.lang === "en" ? pg.path : null);
  if (!enPath) continue;
  const rec = (staticPages[enPath] ||= { type: pg.type, langs: {} });
  for (const [L, pth] of Object.entries(pg.langLinks)) (rec.paths ||= {})[L] ||= pth;
  if (rec.langs[pg.lang]) continue;
  const main = $(".page-content, .article-content, .content-wrap .container").first();
  const title = $(".page-title h1, h1").first().text().trim();
  const art = $(".article-full .article-content, .page-full .article-content, .article-content").first();
  rec.langs[pg.lang] = { path: pg.path, title, metaTitle: $("title").text().replace(/^Tickets 2000 \| /, "").trim(), html: art.length ? cleanHtml($, art) : main.length ? cleanHtml($, main) : "" };
}

// ---------- assemble ----------
const out = { products: [], categories: [], pages: staticPages };
const allPids = new Set([...Object.keys(cardInfo), ...Object.keys(products)]);
for (const pid of [...allPids].sort((a, b) => a - b)) {
  const c = cardInfo[pid] || { langs: {}, hrefs: {} };
  const d = products[pid] || { i18n: {}, reviews: [], gallery: [] };
  const slugs = {}, hrefs = {};
  for (const [L, set] of Object.entries(c.hrefs)) {
    hrefs[L] = [...set];
    slugs[L] = [...set][0].split("/").filter(Boolean).pop();
  }
  // product pages' language links give product slugs too
  for (const pg of pages.filter((x) => x.type === "product" && (x.html.match(/setProductId\((\d+)\)/) || [])[1] === pid)) {
    for (const [L, pth] of Object.entries(pg.langLinks)) {
      slugs[L] ||= pth.split("/").filter(Boolean).pop();
      (hrefs[L] ||= []).includes(pth) || hrefs[L].push(pth);
    }
    (hrefs[pg.lang] ||= []).includes(pg.path) || hrefs[pg.lang].push(pg.path);
  }
  const i18n = {};
  for (const L of LANGS) {
    const card = c.langs[L], det = d.i18n[L];
    if (!card && !det) continue;
    i18n[L] = { title: det?.title || card?.title || "", cardTitle: card?.title || det?.title || "", location: card?.location || "", props: card?.props || [], labels: card?.labels || [], ...(det || {}) };
  }
  out.products.push({
    id: +pid,
    slugs, hrefs,
    image: c.img || d.gallery[0] || null,
    gallery: d.gallery,
    rating: c.rating || d.ratingDetail || null,
    reviewCount: c.reviews || null,
    bars: d.bars || null,
    price: c.price ?? null,
    oldPrice: c.oldPrice ?? null,
    lat: d.lat ?? null, lng: d.lng ?? null,
    reviews: d.reviews,
    i18n,
  });
}
for (const [enSlug, c] of Object.entries(categories)) {
  out.categories.push({ id: enSlug, slugs: c.slugs, header: c.header || null, headerRaw: c.headerRaw || null, i18n: c.i18n, pids: c.pids.map(Number), extraPids: [...new Set(c.extraPids || [])].map(Number) });
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 1));
console.log(`products ${out.products.length}, categories ${out.categories.length}, static pages ${Object.keys(staticPages).length}`);
for (const p of out.products) console.log(p.id, Object.keys(p.i18n).join(","), "| detail:", Object.keys((products[p.id] || { i18n: {} }).i18n).join(","), "| img:", !!p.image, "gal:", p.gallery.length, "rev:", p.reviews.length);
for (const c of out.categories) console.log("CAT", c.id, JSON.stringify(c.slugs), "langs:", Object.keys(c.i18n).join(","), "pids:", c.pids.length, "header:", c.header);
for (const [k, v] of Object.entries(staticPages)) console.log("PAGE", k, v.type, Object.keys(v.langs).join(","), JSON.stringify(v.paths));
