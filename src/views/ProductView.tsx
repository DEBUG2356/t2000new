import { SectionTitle, WhyChooseUs } from "@/components/Blocks";
import { Money } from "@/components/Currency";
import { IconBolt, IconClock, IconMobile, IconShield, IconTick } from "@/components/Icons";
import ProductCard from "@/components/ProductCard";
import ProductSlider from "@/components/ProductSlider";
import Booking, { BuyNowButton } from "@/components/product/Booking";
import Collapse from "@/components/product/Collapse";
import Gallery from "@/components/product/Gallery";
import Reviews from "@/components/product/Reviews";
import Share from "@/components/product/Share";
import Stars from "@/components/Stars";
import {
  pageUrl,
  productCoords,
  productHeading,
  productImages,
  productPackage,
  productPrice,
  productText,
  productTitle,
  productUrl,
  type Catalog,
  type Category,
  type Product,
} from "@/lib/catalog";
import { getDict } from "@/lib/i18n";
import { site, type Lang } from "@/lib/site";

export default function ProductView({ product: p, category, lang, catalog }: { product: Product; category: Category; lang: Lang; catalog: Catalog }) {
  const t = getDict(lang);
  const tp = t.product;
  const title = productHeading(p, lang);
  const text = productText(p, lang);
  const images = productImages(p);
  const coords = productCoords(p);
  const similar = catalog.inCategory(category).filter((x) => x.id !== p.id);
  const fp = productPrice(p);
  const parts = catalog.parts(p);
  const url = site.url + productUrl(p, lang, category);
  const services = [
    { icon: IconBolt, label: t.props.instant },
    { icon: IconMobile, label: t.props.mobile },
    { icon: IconClock, label: t.props.flexible },
    { icon: IconShield, label: tp.covid },
  ];

  return (
    <>
      <div className="container-site pt-5 pb-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Gallery images={images} alt={title} seeMore={tp.seeMore} />

          <aside className="flex flex-col rounded-lg bg-[#f6f6f6] p-5">
            <h1 className="font-display text-[1.6em] leading-tight font-semibold">{title}</h1>
            {p.rating ? (
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
                <Stars value={p.rating} className="size-4" />
                <span className="text-slate">{p.rating} / 5</span>
                {p.reviewCount ? (
                  <a href="#reviews" className="text-slate hover:text-brand-red">
                    {p.reviewCount} {tp.reviewsCount}
                  </a>
                ) : null}
              </div>
            ) : null}
            {fp && (
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-sm text-muted">{t.card.from}</span>
                <Money eur={fp.price} className={`text-2xl font-semibold ${fp.oldPrice ? "text-brand-red" : ""}`} />
                {fp.oldPrice ? <Money eur={fp.oldPrice} className="text-[#777] line-through" /> : null}
              </div>
            )}
            <div className="mt-5">
              <Booking
                product={{
                  id: p.id,
                  title,
                  tickets: p.tickets,
                  minQty: p.minQty,
                  parts: parts.map((x) => ({ id: x.id, title: productHeading(x, lang), timeSlots: x.timeSlots, closedWeekdays: x.closedWeekdays, closedDates: x.closedDates, months: x.months })),
                }}
                checkoutUrl={pageUrl("checkout", lang)}
                contactUrl={pageUrl("contact", lang)}
                buttonLabel={t.card.checkAvailability}
                t={t.booking}
              />
            </div>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-[15px] lg:grid-cols-1">
              {services.map(({ icon: I, label }) => (
                <li key={label} className="flex items-center gap-2.5">
                  <I className="size-5 shrink-0 text-[#444]" />
                  {label}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex justify-end pt-4">
              <Share url={url} title={title} label={tp.share} t={t.share} />
            </div>
          </aside>
        </div>

        <div className="mt-6 lg:max-w-none">
          <div className="px-0 pb-4 lg:px-3">
            <div className="mb-2 font-display text-[1.6em]">{tp.package}</div>
            <ul className="list-disc pl-8">
              {productPackage(p, lang, parts).map((x) => (
                <li key={x}>
                  <h2 className="text-[15px] font-normal">{x}</h2>
                </li>
              ))}
            </ul>
          </div>

          {text.overview && (
            <section className="border-t border-[#dee2e6] px-0 pt-6 pb-2 lg:px-3">
              <div className="mb-1 font-poppins text-[1.45rem] font-semibold">{tp.overview}</div>
              <div className="rich" dangerouslySetInnerHTML={{ __html: text.overview }} />
            </section>
          )}

          {text.included && text.included.length > 0 && (
            <section className="border-t border-[#dee2e6] px-0 pt-6 pb-4 lg:px-3">
              <div className="mb-3 font-poppins text-[1.45rem] font-semibold">{tp.included}</div>
              <ul className="space-y-1.5 font-poppins">
                {text.included.map((x) => (
                  <li key={x} className="flex items-start gap-3">
                    <IconTick className="mt-1 size-4 shrink-0 text-lime" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="border-t border-[#dee2e6] py-6 text-center">
            <BuyNowButton label={tp.buyNow} />
          </div>

          {text.info && (
            <Collapse title={tp.info}>
              <div className="rich" dangerouslySetInnerHTML={{ __html: text.info }} />
            </Collapse>
          )}
          {text.additional && (
            <Collapse title={tp.additional}>
              <div className="rich two-col" dangerouslySetInnerHTML={{ __html: text.additional }} />
            </Collapse>
          )}
          {(text.address || coords) && (
            <Collapse title={tp.location}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  {text.address && <p className="font-poppins">{text.address}</p>}
                  {coords && (
                    <a href={`https://www.google.com/maps?q=${coords[0]},${coords[1]}`} target="_blank" rel="noopener noreferrer" className="btn-dark mt-3 inline-block px-3 py-1.5 text-[15px]">
                      {tp.openMaps}
                    </a>
                  )}
                </div>
                {coords && (
                  <iframe
                    title={tp.location}
                    loading="lazy"
                    className="h-[300px] w-full rounded border-0 bg-paper"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords[1] - 0.008}%2C${coords[0] - 0.005}%2C${coords[1] + 0.008}%2C${coords[0] + 0.005}&layer=mapnik&marker=${coords[0]}%2C${coords[1]}`}
                  />
                )}
              </div>
            </Collapse>
          )}
          {text.cancellation && (
            <Collapse title={tp.cancellation}>
              <div className="rich two-col-after" dangerouslySetInnerHTML={{ __html: text.cancellation }} />
            </Collapse>
          )}

          {p.rating && p.reviewCount ? (
            <Reviews
              // reviews taken over from another product (e.g. a combo) carry its name
              reviews={p.reviews.map((r) => {
                const from = r.fromProduct ? catalog.get(r.fromProduct) : undefined;
                return { ...r, source: from ? productTitle(from, lang) : undefined };
              })}
              rating={p.rating}
              count={p.reviewCount}
              bars={p.bars}
              t={{ reviews: tp.reviews, reviewsCount: tp.reviewsCount, stars: tp.stars, showMore: tp.showMoreReviews, reviewOf: tp.reviewOf }}
            />
          ) : null}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="container-site py-10">
          <SectionTitle title={tp.similar} />
          <ProductSlider>
            {similar.map((x) => (
              <ProductCard key={x.id} p={x} lang={lang} category={category} />
            ))}
          </ProductSlider>
        </section>
      )}
      <WhyChooseUs lang={lang} />
    </>
  );
}
