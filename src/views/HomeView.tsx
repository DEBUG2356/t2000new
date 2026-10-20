import Image from "next/image";
import Link from "next/link";
import { Partners, SectionTitle, WhyChooseUs } from "@/components/Blocks";
import DropTitle from "@/components/DropTitle";
import { Newsletter } from "@/components/Forms";
import ProductCard from "@/components/ProductCard";
import ProductSlider from "@/components/ProductSlider";
import { HOME_SECTIONS } from "@/data/shop";
import { categoryUrl, getCategory, pageUrl, type Catalog } from "@/lib/catalog";
import { getDict } from "@/lib/i18n";
import type { Lang } from "@/lib/site";

export default function HomeView({ lang, catalog }: { lang: Lang; catalog: Catalog }) {
  const t = getDict(lang);
  return (
    <>
      <section className="relative h-[300px] overflow-hidden sm:h-[380px] lg:h-[460px]">
        <Image src="/storage/slider/header-bg-2.webp" alt="" fill priority sizes="100vw" className="object-cover object-[65%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/45 via-white/10 to-transparent" />
        <div className="container-site relative flex h-full items-start pt-8 sm:pt-10">
          <h1 className="max-w-[11ch] font-display text-[2.6rem] leading-[1.08] font-semibold text-[#333] sm:text-[3.4rem] lg:text-[4rem]">
            <DropTitle text={t.hero} />
          </h1>
        </div>
      </section>

      {HOME_SECTIONS.map((s) => {
        const cat = getCategory(s.category)!;
        const products = catalog.inCategory(cat).slice(0, s.limit);
        if (!products.length) return null;
        const sub = { topOffers: t.home.topOffersSub, boatTours: t.home.boatToursSub, nearParis: t.home.nearParisSub }[s.key];
        return (
          <section key={s.key} className="container-site py-12">
            <SectionTitle title={t.home[s.key]} sub={sub} />
            <ProductSlider>
              {products.map((p) => (
                <ProductCard key={p.id} p={p} lang={lang} category={cat} />
              ))}
            </ProductSlider>
            <div className="mt-8 text-center">
              <Link href={categoryUrl(cat, lang)} className="btn-outline-red inline-flex items-center gap-3 px-7 py-2.5 text-lg">
                {t.home.viewAll} <span aria-hidden>›</span>
              </Link>
            </div>
          </section>
        );
      })}

      <Newsletter t={t.newsletter} lang={lang} privacyUrl={pageUrl("privacy", lang)} />
      <Partners lang={lang} />
      <WhyChooseUs lang={lang} />
    </>
  );
}
