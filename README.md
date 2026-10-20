# Tickets 2000 – Next.js

A tickets2000.com újraépítése a Wayback Machine mentéséből (TourCierge). Next.js 16 + Tailwind v4, 6 nyelv (en, fr, es, de, sk, it), Supabase (termékek + rendelések), Stripe-fizetés, admin panel.

## Fejlesztés

```bash
npm install
npm run dev -- -p 3250
```

Admin: `/admin` (jelszó az `ADMIN_PASSWORD` változóban).

## Környezeti változók (`.env.local` / Vercel)

| Változó | Mire kell |
| --- | --- |
| `SUPABASE_URL` | `https://wehmhimjsdtbqtdqfyoe.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase secret key (`sb_secret_…`) – csak szerveren használjuk |
| `ADMIN_PASSWORD` | admin panel jelszava |
| `ADMIN_SECRET` | hosszú véletlen szöveg, ezzel írjuk alá az admin sütit |
| `STRIPE_SECRET_KEY` | Stripe titkos kulcs (élesben az éles fiók kulcsa) |
| `STRIPE_WEBHOOK_SECRET` | a `/api/stripe/webhook` végpont aláíró titka (esemény: `checkout.session.completed`) |
| `RESEND_API_KEY` | e-mail küldés (rendelés-visszaigazolás, kapcsolat, hírlevél) |
| `EMAIL_FROM` | feladó, pl. `Tickets 2000 <no-reply@tickets2000.com>` (Resendben igazolt domain kell) |
| `SALES_EMAIL` | ide mennek a rendelések és üzenetek (alapból `sales@tickets2000.com`) |
| `NEXT_PUBLIC_SITE_URL` | `https://tickets2000.com` |
| `GEMINI_API_KEY` | automatikus fordítás (admin: mentéskor a hiányzó nyelvek, „Újrafordítás angolból” gomb) |
| `DATABASE_URL` | csak a helyi szkripteknek (`scripts/db.mjs`), a futó oldalnak nem kell |

Stripe-kulcs nélkül fejlesztés közben a fizetés „demó” módban fut, Resend-kulcs nélkül az e-mailek csak a szervernaplóba kerülnek.

## Adatok

- **Supabase `products`:** minden termék (szövegek 6 nyelven, képek, jegytípusok és árak, zárvatartás, idősávok). Az admin panelben szerkeszthető; mentéskor a weboldal azonnal frissül. Ha közvetlenül a Supabase-ben módosítasz, az admin „Weboldal frissítése” gombjával töröld a gyorsítótárat.
- **Supabase `orders`:** rendelések – `adult`, `senior`, `youth`, `child`, `infant` darabszám külön oszlopban, `date`, `time_slot`, termék, összeg, státusz (`pending` → `paid` a Stripe-fizetés után), valamint két jelző: `sent` (jegyek kiküldve) és `exported` (átvezetve a Google Sheetsbe), alapból `false` (`supabase/004_order_flags.sql`).
- **Supabase `closures`:** a termék naptárában lezárt napok (`slot = ''`) és időpontok (`slot = '09:30'`). Az admin naptára havonta csak ezt a kis táblát és az adott termék rendeléseit kérdezi le; egy kattintás = egy sor beszúrása/törlése. A vásárlói naptár a `/api/availability` végponton kapja meg, a pénztár szerveroldalon is ellenőrzi.
- **Kombók:** a `products.components` az alap jegyek id-jei. A kombónak saját leírása, képei és jegyárai vannak; nyitvatartást, időpontot és lezárást az alap jegyekből vesz. A vevő alap jegyenként választ dátumot/időpontot; a rendelésben alap jegyenként külön sor lesz (`orders.group_ref` köti össze, `combo_id` / `combo_name` mutatja a kombót, az összeg az alap jegyek árának arányában oszlik meg). Séma: `supabase/003_combos.sql`.
- **Időpontok:** a termékben első időpont + utolsó időpont + időköz (`slot_from`, `slot_to`, `slot_step`), ebből generálódik a `time_slots` lista mentéskor.
- **Supabase Storage `media`:** az adminból feltöltött képek.
- Séma: `supabase/schema.sql`, majd `supabase/002_closures.sql` (`node scripts/db.mjs <fájl>`). Kezdő termékadatok feltöltése (csak a hiányzókat): `npx tsx scripts/seed.mts` (`--force` felülír mindent).
- Kategóriák, főoldali sávok, partnerlogók: `src/data/shop.ts` · elérhetőségek, üzemeltető, USD-árfolyam: `src/lib/site.ts` · felületi szövegek: `src/lib/i18n.ts`.
- Pótképek (Wikimedia Commons) forrásmegjelöléssel: `public/media`, `src/data/credits.json`, oldal: `/photo-credits`.

## Fordítás

Az angol a fő szöveg. Az admin mentéskor a többi nyelv üres (vagy még angol) mezőit a Gemini lefordítja; a meglévő fordításokat és az URL-eket (slug) nem írja felül. Az összes termék egyszerre: `npx tsx scripts/translate.mts` (vagy csak néhány: `npx tsx scripts/translate.mts 12 135`). A 2026-10-20-i tömeges fordítás előtti szövegek a `products_i18n_backup` táblában vannak.

## Archívum-szkriptek

- `scripts/scrape.mjs` – oldalak letöltése a Wayback Machine-ből (`_archive/raw`)
- `scripts/images.mjs` – képek letöltése (`_archive/img`)
- `scripts/extract.mjs` – `src/data/catalog.json` előállítása (a seed forrása)
- `scripts/commons.mjs`, `scripts/commons-prune.mjs` – pótképek kezelése
