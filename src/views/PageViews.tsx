import Link from "next/link";
import { Suspense } from "react";
import { WhyChooseUs } from "@/components/Blocks";
import { ContactForm } from "@/components/Forms";
import { CATEGORIES } from "@/data/shop";
import {
  categoryUrl,
  pageContent,
  pageUrl,
  photoCredits,
  productCover,
  productHeading,
  productLocation,
  productTitle,
  productUrl,
  type Catalog,
  type PageKey,
} from "@/lib/catalog";
import { getDict } from "@/lib/i18n";
import { site, type Lang } from "@/lib/site";
import CheckoutForm from "./checkout/CheckoutForm";
import OrderResult from "./checkout/OrderResult";
import SearchResults from "./SearchResults";

function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-6 font-display text-[2rem] leading-tight font-semibold">{children}</h1>;
}

export function pageTitle(key: PageKey, lang: Lang) {
  const t = getDict(lang);
  const f = t.footer;
  const titles: Record<PageKey, string> = {
    privacy: f.privacy,
    terms: f.terms,
    refund: f.refund,
    partner: f.becomePartner,
    contact: t.contact.title,
    search: t.search.title,
    sitemap: t.sitemapTitle,
    credits: t.photoCredits,
    checkout: t.checkout.title,
    success: t.checkout.successTitle,
    cancel: t.checkout.cancelTitle,
  };
  return pageContent(key, lang)?.title || titles[key];
}

export default function PageView({ page, lang, catalog }: { page: PageKey; lang: Lang; catalog: Catalog }) {
  const t = getDict(lang);

  if (page === "contact") {
    return (
      <>
        <div className="container-site grid gap-10 py-10 md:grid-cols-[1fr_2fr]">
          <div>
            <PageTitle>{t.contact.contacts}</PageTitle>
            <p className="mb-2">
              <a href={`mailto:${site.email}`} className="hover:text-brand-red">
                {site.email}
              </a>
            </p>
            <p>
              <a href={`tel:${site.phone}`} className="hover:text-brand-red">
                {site.phone}
              </a>
            </p>
          </div>
          <div>
            <h2 className="mb-5 font-display text-[1.6rem] font-semibold">{t.contact.title}</h2>
            <ContactForm t={t.contact} consent={t.newsletter.consent} policy={t.newsletter.policy} privacyUrl={pageUrl("privacy", lang)} lang={lang} />
          </div>
        </div>
        <WhyChooseUs lang={lang} />
      </>
    );
  }

  if (page === "search") {
    return (
      <>
        <div className="container-site py-10">
          <PageTitle>{t.search.title}</PageTitle>
          <Suspense>
            <SearchResults
              t={t.search}
              items={catalog.products.map((p) => ({
                id: p.id,
                title: productTitle(p, lang),
                alt: productTitle(p, "en"),
                location: productLocation(p, lang),
                url: productUrl(p, lang),
                cover: productCover(p),
              }))}
            />
          </Suspense>
        </div>
        <WhyChooseUs lang={lang} />
      </>
    );
  }

  if (page === "sitemap") {
    return (
      <div className="container-site py-10">
        <PageTitle>{t.sitemapTitle}</PageTitle>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <div key={c.id}>
              <Link href={categoryUrl(c, lang)} className="font-display text-xl font-semibold hover:text-brand-red">
                {c.title[lang]}
              </Link>
              <ul className="mt-2 space-y-1 text-[15px]">
                {catalog.inCategory(c).map((p) => (
                  <li key={p.id}>
                    <Link href={productUrl(p, lang, c)} className="text-[#555] hover:text-brand-red">
                      {productTitle(p, lang)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <div className="font-display text-xl font-semibold">{t.footer.about}</div>
            <ul className="mt-2 space-y-1 text-[15px]">
              {(["partner", "contact", "privacy", "terms", "refund", "credits"] as PageKey[]).map((k) => (
                <li key={k}>
                  <Link href={pageUrl(k, lang)} className="text-[#555] hover:text-brand-red">
                    {pageTitle(k, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (page === "credits") {
    const credits = photoCredits();
    return (
      <div className="container-site py-10">
        <PageTitle>{t.photoCredits}</PageTitle>
        <ul className="space-y-2 text-sm text-[#555]">
          {Object.values(credits)
            .flat()
            .filter((c, i, arr) => arr.findIndex((x) => x.source === c.source) === i)
            .map((c) => (
              <li key={c.file}>
                <a href={c.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-red">
                  {c.title}
                </a>{" "}
                — {c.author.slice(0, 120)}, {c.licenseUrl ? <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{c.license}</a> : c.license}, via Wikimedia Commons
              </li>
            ))}
        </ul>
      </div>
    );
  }

  if (page === "checkout") {
    return (
      <div className="container-site py-10">
        <PageTitle>{t.checkout.title}</PageTitle>
        <Suspense>
          <CheckoutForm
            lang={lang}
            t={t.checkout}
            tb={t.booking}
            termsUrl={pageUrl("terms", lang)}
            privacyUrl={pageUrl("privacy", lang)}
            termsLabel={t.footer.terms}
            privacyLabel={t.footer.privacy}
            products={Object.fromEntries(
              catalog.products.map((p) => [
                p.id,
                {
                  title: productTitle(p, lang),
                  url: productUrl(p, lang),
                  cover: productCover(p),
                  tickets: p.tickets,
                  minQty: p.minQty,
                  parts: catalog.parts(p).map((x) => ({ id: x.id, title: productHeading(x, lang), timeSlots: x.timeSlots, closedWeekdays: x.closedWeekdays, closedDates: x.closedDates, months: x.months })),
                },
              ]),
            )}
          />
        </Suspense>
      </div>
    );
  }

  if (page === "success" || page === "cancel") {
    return (
      <div className="container-site py-16">
        <Suspense>
          <OrderResult kind={page} t={t.checkout} home={lang === "en" ? "/" : `/${lang}`} />
        </Suspense>
      </div>
    );
  }

  const content = pageContent(page, lang);
  return (
    <>
      <div className="container-site py-10">
        <PageTitle>{pageTitle(page, lang)}</PageTitle>
        {content && <div className={`rich ${page === "partner" ? "" : "legal"}`} dangerouslySetInnerHTML={{ __html: content.html }} />}
      </div>
      {page === "partner" && <WhyChooseUs lang={lang} />}
    </>
  );
}
